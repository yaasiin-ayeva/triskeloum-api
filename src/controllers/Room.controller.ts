import { NextFunction, Response } from "express";
import { Room } from "../models/crm/Room.model";
import { Message } from "../models/crm/Message.model";
import { Call } from "../models/crm/Call.model";
import { Attachment } from "../models/crm/Attachment.model";
import { User } from "../models/User.model";
import { BaseController } from "./Base.controller";
import RoomService from "../services/Room.service";
import { socket } from "../sockets/socket-handler.sockets";
import path from "path";

export default class CRMController extends BaseController<RoomService> {

    constructor() {
        super(new RoomService(), 'room');
    }

    public createRoom = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
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
                // make user join the rooms
                // socket.to(`room_${room.id}`).emit("room:user_joined", { userId: user.id, roomId: room.id });
            });

            return this.apiResponse(res, 201, "Room created", room);

        } catch (error) {
            next(error);
        }
    }

    public getRoom = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params;
            const currentUser = req.user;

            if (!id || isNaN(parseInt(id))) {
                return this.apiResponse(res, 400, "Room id is required");
            }

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
            next(error);
        }
    }

    public getUserRooms = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const currentUser = req.user;
            const { type } = req.query;

            let query = Room.getDatasource().createQueryBuilder("room")
                .innerJoinAndSelect("room.users", "user")
                .leftJoinAndSelect("room.messages", "messages")
                .leftJoinAndSelect("messages.user", "message_user")
                .where("user.id = :userId", { userId: currentUser.id });

            if (type === 'direct') {
                query = query.andWhere("room.isDirect = true");
            } else if (type === 'group') {
                query = query.andWhere("room.isDirect = false");
            }

            const rooms = await Room.getDatasource().createQueryBuilder("room")
                .leftJoinAndSelect("room.users", "users")
                .leftJoinAndSelect("room.messages", "messages")
                .leftJoinAndSelect("messages.user", "message_user")
                .where(qb => {
                    const subQuery = qb.subQuery()
                        .select("subRoom.id")
                        .from(Room, "subRoom")
                        .innerJoin("subRoom.users", "subUser")
                        .where("subUser.id = :userId", { userId: currentUser.id });

                    if (type === 'direct') {
                        subQuery.andWhere("subRoom.isDirect = true");
                    } else if (type === 'group') {
                        subQuery.andWhere("subRoom.isDirect = false");
                    }

                    return "room.id IN " + subQuery.getQuery();
                })
                .setParameter("userId", currentUser.id)
                .orderBy("messages.created_at", "DESC")
                .getMany();

            rooms.forEach(room => {
                room.users.forEach(user => {
                    delete user.password;
                });
            });

            return this.apiResponse(res, 200, "Rooms found", rooms);
        } catch (error) {
            next(error);
        }
    }

    public addUsersToRoom = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
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
                delete user.password;
                socket.to(`user_${user.id}`).emit("room:updated", room);
            });

            return this.apiResponse(res, 200, "Room updated", room);
        } catch (error) {
            next(error);
        }
    }

    public removeUserFromRoom = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
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
                delete user.password;
                socket.to(`user_${user.id}`).emit("room:updated", room);
            });

            socket.to(`user_${userId}`).emit("room:removed", { roomId });

            return this.apiResponse(res, 200, "Room updated", room);
        } catch (error) {
            next(error);
        }
    }

    // ===== MESSAGES =====
    public sendMessage = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { roomId } = req.params;
            const { content, repliedToId } = req.body;
            const currentUser = req.user;
            const attachments = req.files as Express.Multer.File[];

            if (!roomId || isNaN(parseInt(roomId))) {
                return this.apiResponse(res, 400, "Room id is required");
            }

            if (!content || typeof content !== "string") {
                return this.apiResponse(res, 400, "Message content is required");
            }

            if (repliedToId && isNaN(parseInt(repliedToId))) {
                return this.apiResponse(res, 400, "Replied to id is required");
            }

            if (content.trim().length === 0 && attachments.length === 0) {
                return this.apiResponse(res, 400, "Message content cannot be empty");
            }

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

            delete room.messages;

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
                        path: path.posix.join(...file.path.split(path.sep)),
                        mimetype: file.mimetype,
                        message
                    });
                    await attachment.save();
                    message.attachments = [...(message.attachments || []), attachment];
                }
                await message.save();
            }

            const messageData = {
                id: message.id,
                content: message.content,
                user: {
                    id: message.user.id,
                    firstname: message.user.firstname,
                    lastname: message.user.lastname,
                    email: message.user.email,
                    role: message.user.role,
                    picture: message.user.picture
                },
                roomId: message.room.id,
                attachments: message.attachments?.map(a => ({
                    filename: a.filename,
                    path: a.path,
                    mimetype: a.mimetype
                }))
            };

            room.users.forEach(user => {
                delete user.password;
                if (user.id !== currentUser.id) {
                    socket.to(`user_${user.id}`).emit("message:received", messageData);
                }
            });

            return this.apiResponse(res, 200, "Message sent", messageData);
        } catch (error) {
            next(error);
        }
    }

    public markMessageAsDelivered = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params;
            const currentUser = req.user;

            if (!id || isNaN(parseInt(id))) {
                return this.apiResponse(res, 400, "Message id is required");
            }

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

            delete message.room.users;
            delete message.room.messages;
            delete message.room.calls;

            message.deliveredAt = new Date();
            await message.save();

            socket.to(`user_${currentUser.id}`).emit("message:delivered", {
                messageId: message.id,
                deliveredAt: message.deliveredAt
            });

            return this.apiResponse(res, 200, "Message marked as delivered", message);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark message as seen
     */
    public markMessageAsSeen = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params;
            const currentUser = req.user;

            if (!id || isNaN(parseInt(id))) {
                return this.apiResponse(res, 400, "Message id is required");
            }

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

            delete message.room.users;
            delete message.room.messages;
            delete message.room.calls;

            message.seenAt = new Date();
            await message.save();

            socket.to(`user_${currentUser.id}`).emit("message:seen", {
                messageId: message.id,
                seenAt: message.seenAt
            });

            return this.apiResponse(res, 200, "Message marked as seen", message);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Edit message
     */
    public editMessage = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const currentUser = req.user;

            if (!id || isNaN(parseInt(id))) {
                return this.apiResponse(res, 400, "Message id is required");
            }

            if (!content) {
                return this.apiResponse(res, 400, "Content is required");
            }

            if (content.trim() === "") {
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

            delete message.room.users;
            delete message.room.messages;
            delete message.room.calls;
            delete message.user.password;

            return this.apiResponse(res, 200, "Message edited", message);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete message
     */
    public deleteMessage = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { id } = req.params;
            const currentUser = req.user;

            if (!id || isNaN(parseInt(id))) {
                return this.apiResponse(res, 400, "Message id is required");
            }

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
                    socket.to(`user_${currentUser.id}`).emit("message:deleted", {
                        messageId,
                        roomId
                    });
                }
            });

            return this.apiResponse(res, 200, "Message deleted");
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get messages for a room
     */
    public getRoomMessages = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { roomId } = req.params;
            const { limit = 50, offset = 0 } = req.query;
            const currentUser = req.user;

            if (!roomId || isNaN(parseInt(roomId))) {
                return this.apiResponse(res, 400, "Room id is required");
            }

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

            messages.forEach(message => {
                delete message.user.password;
                if (message.repliedTo && message.repliedTo.user) {
                    delete message.repliedTo.user.password;
                }
            });

            return this.apiResponse(res, 200, "Messages found", messages);
        } catch (error) {
            next(error);
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

    public getOrCreateDirectRoom = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { targetUserId } = req.params;
            const currentUser = req.user;

            if (!targetUserId) {
                return this.apiResponse(res, 400, "Target user ID is required");
            }

            const targetUser = await User.getById(parseInt(targetUserId));
            if (!targetUser) {
                return this.apiResponse(res, 404, "Target user not found");
            }

            const existingRoom = await Room.getDatasource()
                .createQueryBuilder("room")
                .innerJoinAndSelect("room.users", "users")
                .where("room.isDirect = :isDirect", { isDirect: true })
                .andWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select("ru.room_id")
                        .from("room_users", "ru")
                        .where("ru.user_id IN (:...userIds)", { userIds: [currentUser.id, targetUser.id] })
                        .groupBy("ru.room_id")
                        .having("COUNT(DISTINCT ru.user_id) = 2")
                        .getQuery();
                    return "room.id IN " + subQuery;
                })
                .getOne();

            if (existingRoom) {
                existingRoom.users.forEach(user => {
                    delete user.password;
                });
                return this.apiResponse(res, 200, "Direct room found", existingRoom);
            }

            const newRoom = new Room({
                users: [currentUser, targetUser],
                isDirect: true,
                isDraft: false
            });

            await newRoom.save();
            newRoom.users.forEach(user => {
                delete user.password;
            });

            [currentUser.id, targetUser.id].forEach(userId => {
                socket.to(`user_${userId}`).emit("room:created", newRoom);
            });

            return this.apiResponse(res, 201, "Direct room created", newRoom);
        } catch (error) {
            next(error);
        }
    }
}