import { Socket } from "socket.io";
import { User } from "../../models/User.model";
import { Message } from "../../models/crm/Message.model";
import { Room } from "../../models/crm/Room.model";
import { socket as io } from "../socket-handler.sockets";
import logger from "../../config/logger.config";
import { CallSignalData } from "../../types/types/socket.type";

export default class SocketEventsHandler {
    private socket: Socket;
    private user: User;

    constructor(socket: Socket, user: User) {
        this.socket = socket;
        this.user = user;
        this.initialize();
    }

    private initialize(): void {
        this.socket.join(`user_${this.user.id}`);

        io.emit("user:status", {
            userId: this.user.id,
            status: "online"
        });

        this.handleTyping();
        this.handleStatus();
        this.handleJoinRoom();
        this.handleLeaveRoom();
        this.handleCallSignal();
        this.handleMessageRead();
        this.handleDisconnect();
    }

    private handleTyping(): void {
        this.socket.on("typing", ({ roomId, isTyping }: { roomId: number, isTyping: boolean }) => {
            this.socket.to(`room_${roomId}`).emit("user:typing", {
                userId: this.user.id,
                isTyping,
                roomId
            });
            logger.debug(`User ${this.user.id} typing status in room ${roomId}: ${isTyping}`);
        });
    }

    private handleStatus(): void {
        this.socket.on("status", ({ status }: { status: string }) => {
            io.emit("user:status", {
                userId: this.user.id,
                status
            });
            logger.debug(`User ${this.user.id} status changed to: ${status}`);
        });
    }

    private handleJoinRoom(): void {
        this.socket.on("join:room", async ({ roomId }: { roomId: number }) => {

            logger.debug(`User ${this.user.id} trying to join room ${roomId}`);
            try {
                const room = await Room.getOneByIdWithRelations(parseInt(roomId.toString()), ["users"]);

                if (!room) {
                    this.socket.emit("error", { message: "Room not found" });
                    return;
                }

                const isUserInRoom = room.users.some(user => user.id === this.user.id);
                if (!isUserInRoom) {
                    this.socket.emit("error", { message: "Access denied to this room" });
                    return;
                }

                this.socket.join(`room_${roomId}`);
                logger.debug(`User ${this.user.id} joined room ${roomId}`);

                this.socket.to(`room_${roomId}`).emit("room:user_joined", {
                    userId: this.user.id,
                    roomId
                });
            } catch (error) {
                logger.error(`Error joining room: ${error}`);
                this.socket.emit("error", { message: "Error joining room" });
            }
        });
    }

    private handleLeaveRoom(): void {
        this.socket.on("leave:room", ({ roomId }: { roomId: number }) => {
            this.socket.leave(`room_${roomId}`);
            logger.debug(`User ${this.user.id} left room ${roomId}`);

            this.socket.to(`room_${roomId}`).emit("room:user_left", {
                userId: this.user.id,
                roomId
            });
        });
    }

    private handleCallSignal(): void {
        this.socket.on("call:signal", ({ roomId, signal, to }: CallSignalData) => {
            this.socket.to(`user_${to}`).emit("call:signal", {
                from: this.user.id,
                signal,
                roomId
            });
            logger.debug(`Call signal from user ${this.user.id} to user ${to} in room ${roomId}`);
        });
    }

    private handleMessageRead(): void {
        this.socket.on("message:read", async ({ messageId }: { messageId: number }) => {
            try {
                const message = await Message.getOneByIdWithRelations(messageId, ["user"]);

                if (message && message.user.id !== this.user.id) {
                    message.seenAt = new Date();
                    await message.save();

                    this.socket.to(`user_${message.user.id}`).emit("message:seen", {
                        messageId: message.id,
                        seenAt: message.seenAt,
                        userId: this.user.id
                    });
                    logger.debug(`Message ${messageId} marked as read by user ${this.user.id}`);
                }
            } catch (error) {
                logger.error(`Error handling message read: ${error}`);
            }
        });
    }

    private handleDisconnect(): void {
        this.socket.on("disconnect", () => {
            io.emit("user:status", {
                userId: this.user.id,
                status: "offline"
            });
            logger.debug(`User disconnected: ${this.user.id}`);
        });
    }
}