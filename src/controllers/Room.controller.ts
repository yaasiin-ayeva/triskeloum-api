import { Request, Response } from "express";
import { Room } from "../models/crm/Room.model";
import { Message } from "../models/crm/Message.model";
import { Call } from "../models/crm/Call.model";
import { Attachment } from "../models/crm/Attachment.model";
import { User } from "../models/User.model";
import { BaseController } from "./Base.controller";
import RoomService from "../services/Room.service";
import { socket } from "../sockets/socket-handler.sockets";

// src/controllers/Room.controller.ts

export default class CRMController extends BaseController<RoomService> {

    constructor() {
        super(new RoomService(), 'room');
    }

    public createRoom = async (req, res, next) => {
        try {

            const { users } = req.body;
            const currentUser = req.user;

            if (!users || !Array.isArray(users)) {
                return this.apiResponse(res, 400, "Users list is required");
            }

            if (!users.includes(currentUser.id)) {
                users.push(currentUser.id);
            }

            const userEntities = await User.getByIds(users);
            if (userEntities.length !== users.length) {
                return this.apiResponse(res, 404, "One or more users not found");
            }

            const room = new Room({
                users: userEntities,
                isDraft: false
            });

            await room.save();

            userEntities.forEach(user => {
                socket.to(`user_${user.id}`).emit("room:created", room);
            });

            return this.apiResponse(res, 201, "Room created", room);

        } catch (error) {
            next(error);
        }
    }

    public async getRoom(req: any, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const currentUser = req.user;

            const room = await Room.getOneByIdWithRelations(parseInt(id), ["users", "messages", "messages.user", "messages.attachments", "calls"]);

            if (!room) {
                return this.apiResponse(res, 404, "Room not found");
            }

            const isUserInRoom = room.users.some(user => user.id === currentUser.id);
            if (!isUserInRoom) {
                return this.apiResponse(res, 403, "Access denied");
            }

            return this.apiResponse(res, 200, "Room found", room);
        } catch (error) {
            return this.apiResponse(res, 500, error);
        }
    }

    public async getUserRooms(req: any, res: Response): Promise<Response> {
        try {
            const currentUser = req.user;

            const rooms = await Room.getDatasource().createQueryBuilder("room")
                .innerJoinAndSelect("room.users", "user")
                .leftJoinAndSelect("room.messages", "messages")
                .leftJoinAndSelect("messages.user", "message_user")
                .where("user.id = :userId", { userId: currentUser.id })
                .orderBy("messages.created_at", "DESC")
                .getMany();

            return this.apiResponse(res, 200, "Rooms found", rooms);
        } catch (error) {
            return this.apiResponse(res, 500, error);
        }
    }

    public async addUsersToRoom(req: any, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { users } = req.body;
            const currentUser = req.user;

            if (!users || !Array.isArray(users)) {
                return this.apiResponse(res, 400, "Users list is required");
            }

            const room = await Room.getDatasource().findOne({
                where: { id: parseInt(id) },
                relations: ["users"]
            });

            if (!room) {
                return this.apiResponse(res, 404, "Room not found");
            }

            const isUserInRoom = room.users.some(user => user.id === currentUser.id);
            if (!isUserInRoom) {
                return this.apiResponse(res, 403, "Access denied");
            }

            const userEntities = await User.getDatasource().findByIds(users);
            if (userEntities.length !== users.length) {
                return this.apiResponse(res, 404, "One or more users not found");
            }

            userEntities.forEach(user => {
                if (!room.users.some(existingUser => existingUser.id === user.id)) {
                    room.users.push(user);
                }
            });

            await room.save();

            room.users.forEach(user => {
                socket.to(`user_${user.id}`).emit("room:updated", room);
            });

            return this.apiResponse(res, 200, "Room updated", room);
        } catch (error) {
            return this.apiResponse(res, 500, error);
        }
    }

    public async removeUserFromRoom(req: any, res: Response): Promise<Response> {
        try {
            const { roomId, userId } = req.params;
            const currentUser = req.user;

            const room = await Room.getDatasource().findOne({
                where: { id: parseInt(roomId) },
                relations: ["users"]
            });

            if (!room) {
                return this.apiResponse(res, 404, "Room not found");
            }

            const isUserInRoom = room.users.some(user => user.id === currentUser.id);
            if (!isUserInRoom) {
                return this.apiResponse(res, 403, "Access denied");
            }

            room.users = room.users.filter(user => user.id !== parseInt(userId));

            if (room.users.length === 0) {
                await room.remove();
                return this.apiResponse(res, 200, "Room deleted");
            }

            await room.save();

            room.users.forEach(user => {
                socket.to(`user_${user.id}`).emit("room:updated", room);
            });

            socket.to(`user_${userId}`).emit("room:removed", { roomId });

            return this.apiResponse(res, 200, "Room updated", room);
        } catch (error) {
            return this.apiResponse(res, 500, error);
        }
    }

    // ===== MESSAGES =====
    public async sendMessage(req: any, res: Response): Promise<Response> {
        try {
            const { roomId } = req.params;
            const { content, repliedToId } = req.body;
            const currentUser = req.user;
            const attachments = req.files as Express.Multer.File[];

            const room = await Room.getDatasource().findOne({
                where: { id: parseInt(roomId) },
                relations: ["users"]
            });

            if (!room) {
                return this.apiResponse(res, 404, "Room not found");
            }

            const isUserInRoom = room.users.some(user => user.id === currentUser.id);
            if (!isUserInRoom) {
                return this.apiResponse(res, 403, "Access denied");
            }

            if (!content && (!attachments || attachments.length === 0)) {
                return this.apiResponse(res, 400, "Message must have content or attachments");
            }

            let repliedTo = null;
            if (repliedToId) {
                repliedTo = await Message.getDatasource().findOne({ where: { id: parseInt(repliedToId) } });
                if (!repliedTo) {
                    return this.apiResponse(res, 404, "Replied message not found");
                }
            }

            const message = new Message({
                content: content || "",
                user: currentUser,
                room,
                repliedTo
            });

            await message.save();

            if (attachments && attachments.length > 0) {
                for (const file of attachments) {
                    const attachment = new Attachment({
                        filename: file.originalname,
                        path: file.path,
                        mimetype: file.mimetype,
                        message
                    });
                    await attachment.save();
                    message.attachments = [...(message.attachments || []), attachment];
                }
                await message.save();
            }

            room.users.forEach(user => {
                if (user.id !== currentUser.id) {
                    socket.to(`user_${user.id}`).emit("message:received", {
                        message,
                        roomId: room.id
                    });
                }
            });

            return this.apiResponse(res, 200, "Message sent", message);
        } catch (error) {
            return this.apiResponse(res, 500, error);
        }
    }

    public async markMessageAsDelivered(req: any, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const currentUser = req.user;

            const message = await Message.getDatasource().findOne({
                where: { id: parseInt(id) },
                relations: ["room", "room.users"]
            });

            if (!message) {
                return this.apiResponse(res, 404, "Message not found");
            }

            const isUserInRoom = message.room.users.some(user => user.id === currentUser.id);
            if (!isUserInRoom) {
                return this.apiResponse(res, 403, "Access denied");
            }

            message.deliveredAt = new Date();
            await message.save();

            socket.to(`user_${message.user.id}`).emit("message:delivered", {
                messageId: message.id,
                deliveredAt: message.deliveredAt
            });

            return this.apiResponse(res, 200, "Message marked as delivered", message);
        } catch (error) {
            return this.apiResponse(res, 500, error);
        }
    }

    /**
     * Mark message as seen
     */
    public async markMessageAsSeen(req: any, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const currentUser = req.user;

            const message = await Message.getDatasource().findOne({
                where: { id: parseInt(id) },
                relations: ["room", "room.users"]
            });

            if (!message) {
                return this.apiResponse(res, 404, "Message not found");
            }

            const isUserInRoom = message.room.users.some(user => user.id === currentUser.id);
            if (!isUserInRoom) {
                return this.apiResponse(res, 403, "Access denied");
            }

            message.seenAt = new Date();
            await message.save();

            socket.to(`user_${message.user.id}`).emit("message:seen", {
                messageId: message.id,
                seenAt: message.seenAt
            });

            return this.apiResponse(res, 200, "Message marked as seen", message);
        } catch (error) {
            return this.apiResponse(res, 500, error);
        }
    }

    /**
     * Edit message
     */
    public async editMessage(req: any, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const currentUser = req.user;

            if (!content) {
                return this.apiResponse(res, 400, "Content is required");
            }

            const message = await Message.getDatasource().findOne({
                where: { id: parseInt(id) },
                relations: ["user", "room", "room.users"]
            });

            if (!message) {
                return this.apiResponse(res, 404, "Message not found");
            }

            if (message.user.id !== currentUser.id) {
                return this.apiResponse(res, 403, "Access denied");
            }

            message.content = content;
            message.editedAt = new Date();
            await message.save();

            message.room.users.forEach(user => {
                if (user.id !== currentUser.id) {
                    socket.to(`user_${user.id}`).emit("message:edited", {
                        messageId: message.id,
                        content: message.content,
                        editedAt: message.editedAt
                    });
                }
            });

            return this.apiResponse(res, 200, "Message edited", message);
        } catch (error) {
            return this.apiResponse(res, 500, error);

        }
    }

    /**
     * Delete message
     */
    public async deleteMessage(req: any, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const currentUser = req.user;

            const message = await Message.getDatasource().findOne({
                where: { id: parseInt(id) },
                relations: ["user", "room", "room.users", "attachments"]
            });

            if (!message) {
                return this.apiResponse(res, 404, "Message not found");
            }

            if (message.user.id !== currentUser.id) {
                return this.apiResponse(res, 403, "Access denied");
            }

            const roomId = message.room.id;
            const messageId = message.id;
            const roomUsers = [...message.room.users];

            if (message.attachments && message.attachments.length > 0) {
                for (const attachment of message.attachments) {
                    await attachment.remove();
                }
            }

            await message.remove();

            roomUsers.forEach(user => {
                if (user.id !== currentUser.id) {
                    socket.to(`user_${user.id}`).emit("message:deleted", {
                        messageId,
                        roomId
                    });
                }
            });

            return this.apiResponse(res, 200, "Message deleted");
        } catch (error) {
            return this.apiResponse(res, 500, error);

        }
    }

    /**
     * Get messages for a room
     */
    public async getRoomMessages(req: any, res: Response): Promise<Response> {
        try {
            const { roomId } = req.params;
            const { limit = 50, offset = 0 } = req.query;
            const currentUser = req.user;

            const room = await Room.getDatasource().findOne({
                where: { id: parseInt(roomId) },
                relations: ["users"]
            });

            if (!room) {
                return this.apiResponse(res, 404, "Room not found");
            }

            const isUserInRoom = room.users.some(user => user.id === currentUser.id);
            if (!isUserInRoom) {
                return this.apiResponse(res, 403, "Access denied");
            }

            const messages = await Message.getDatasource().createQueryBuilder("message")
                .leftJoinAndSelect("message.user", "user")
                .leftJoinAndSelect("message.attachments", "attachment")
                .leftJoinAndSelect("message.repliedTo", "repliedTo")
                .leftJoinAndSelect("repliedTo.user", "repliedToUser")
                .where("message.room = :roomId", { roomId })
                .orderBy("message.created_at", "DESC")
                .take(parseInt(limit as string))
                .skip(parseInt(offset as string))
                .getMany();

            return this.apiResponse(res, 200, "Messages found", messages);
        } catch (error) {
            return this.apiResponse(res, 500, error);

        }
    }

    // ===== CALLS =====

    /**
     * Start a call
     */
    public async startCall(req: any, res: Response): Promise<Response> {
        try {
            const { roomId } = req.params;
            const { isVideo } = req.body;
            const currentUser = req.user;

            const room = await Room.getDatasource().findOne({
                where: { id: parseInt(roomId) },
                relations: ["users"]
            });

            if (!room) {
                return this.apiResponse(res, 404, "Room not found");
            }

            const isUserInRoom = room.users.some(user => user.id === currentUser.id);
            if (!isUserInRoom) {
                return this.apiResponse(res, 403, "Access denied");
            }

            const call = new Call({
                room,
                user: currentUser,
                isVideo: Boolean(isVideo),
                durationMin: null
            });

            await call.save();

            room.users.forEach(user => {
                if (user.id !== currentUser.id) {
                    socket.to(`user_${user.id}`).emit("call:incoming", {
                        call,
                        roomId: room.id,
                        caller: currentUser
                    });
                }
            });

            return this.apiResponse(res, 200, "Call started", call);
        } catch (error) {
            return this.apiResponse(res, 500, error);
        }
    }

    /**
     * End a call
     */
    public async endCall(req: any, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { durationMin } = req.body;
            const currentUser = req.user;

            const call = await Call.getDatasource().findOne({
                where: { id: parseInt(id) },
                relations: ["user", "room", "room.users"]
            });

            if (!call) {
                return this.apiResponse(res, 404, "Call not found");
            }

            const isUserCaller = call.user.id === currentUser.id;
            const isUserInRoom = call.room.users.some(user => user.id === currentUser.id);

            if (!isUserCaller && !isUserInRoom) {
                return this.apiResponse(res, 403, "Access denied");
            }

            call.durationMin = durationMin || 0;
            await call.save();

            call.room.users.forEach(user => {
                if (user.id !== currentUser.id) {
                    socket.to(`user_${user.id}`).emit("call:ended", {
                        callId: call.id,
                        roomId: call.room.id,
                        durationMin: call.durationMin
                    });
                }
            });

            return this.apiResponse(res, 200, "Call ended", call);
        } catch (error) {
            return this.apiResponse(res, 500, error);
        }
    }

    /**
     * Get call history for a room
     */
    public async getRoomCallHistory(req: any, res: Response): Promise<Response> {
        try {
            const { roomId } = req.params;
            const currentUser = req.user;

            const room = await Room.getDatasource().findOne({
                where: { id: parseInt(roomId) },
                relations: ["users"]
            });

            if (!room) {
                return this.apiResponse(res, 404, "Room not found");
            }

            const isUserInRoom = room.users.some(user => user.id === currentUser.id);
            if (!isUserInRoom) {
                return this.apiResponse(res, 403, "Access denied");
            }

            const calls = await Call.getDatasource().createQueryBuilder("call")
                .leftJoinAndSelect("call.user", "user")
                .where("call.room = :roomId", { roomId })
                .orderBy("call.created_at", "DESC")
                .getMany();

            return this.apiResponse(res, 200, "Calls found", calls);
        } catch (error) {
            return this.apiResponse(res, 500, error);
        }
    }
}