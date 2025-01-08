// import { Server as SocketServer, Socket } from 'socket.io';
// import ChatRoomService from '../services/communication/chat-room.service';
// import MessageService from '../services/communication/message.service';
// import { SOCKETS_EVENTS as e } from '../types/enums';
// import logger from '../../config/logger.config';
// import { IMessageAttachment } from '../types/interfaces';
// import { UserService } from '../services/hr/user.hr.service';

// export default class SocketHandler {

//     private io: SocketServer;
//     private chatRoomService: ChatRoomService;
//     private messageService: MessageService;
//     private userService: UserService;
//     private connectedUsers: any = {};
//     private authenticatedUser: any = {};
//     private peers: Map<string, string> = new Map();

//     constructor(io: SocketServer) {
//         this.io = io;
//         this.chatRoomService = new ChatRoomService();
//         this.messageService = new MessageService();
//         this.userService = new UserService();
//         this.handleConnection();
//     }

//     private handleConnection() {
//         this.io.on(e.connection, async (socket: Socket) => {
//             this.authenticatedUser = await this.authenticateUser(socket);
//             this.attachSocketEvents(socket);
//             await this.chatRoomService.findChatRooms(this.authenticatedUser).then(chatRooms => {
//                 socket.emit(e.fetched_chat_rooms, chatRooms);
//             });
//             logger.info('client connected');
//         });
//     }

//     private attachSocketEvents(socket: Socket) {

//         socket.on(e.join, async (data: { room: number, user: any }) => {
//             await this.handleJoin(socket, data);
//             // TODO SUPP this, just for test
//             await this.chatRoomService.findChatRooms(this.authenticatedUser).then(chatRooms => {
//                 socket.emit(e.fetched_chat_rooms, chatRooms);
//             });
//             await this.handleConnectedUsers(data.room.toString(), data.user);
//             logger.info('client joined room ' + data.room);
//         });

//         socket.on(e.send_message, async (data: { room: number, message: any }) => {
//             logger.warn('send_message');
//             await this.handleSendMessage(socket, data);
//         });

//         socket.on(e.typing_message, async (data: any) => {
//             logger.warn('typing_message');
//             await this.handleTypingMessage(socket, data);
//         });

//         socket.on(e.set_peer_id, async (data: any) => {
//             logger.warn('save_peer_id');
//             await this.handleUpdatePeerId(socket, data.peerId, data.user);
//         });

//         socket.on(e.send_attachment, async (data: { room: number, attachment: any }) => {
//             logger.warn('send_attachment');
//             await this.handleSendAttachment(socket, data);
//         });

//         socket.on(e.close_call, (data) => {
//             const roomId: string = data?.room?.toString();
//             socket.to(roomId).emit(e.call_ended, { roomId: roomId, partner: data?.partner, hasBeenDeclined: data?.hasBeenDeclined });
//         });

//         socket.on(e.disconnect, () => {
//             logger.info('client disconnected');
//         });
//     }

//     private async authenticateUser(socket: Socket) {

//         // const token = await socket.handshake.auth.token;
//         const currentUser = await socket.handshake.auth.user;

//         try {
//             // if (token && token.length > 0) {
//             //     jwt.verify(token, EnvConfig.JWT_KEY, async (error: any, decodedToken: any) => {
//             //         if (error) {
//             //             throw error;
//             //         }

//             //         const tokenId = decodedToken?.id;

//             //         if (!tokenId) {
//             //             throw new Error("Invalid authorization token");
//             //         }

//             //         try {
//             //             const user = await this.userService.findById(tokenId, true, true, true);

//             //             if (!user) {
//             //                 throw new Error("Invalid authorization token");
//             //             }

//             //             this.authenticatedUser = user;
//             //             return user;

//             //         } catch (error) {
//             //             throw error;
//             //         }
//             //     });
//             // }

//             if (currentUser) {
//                 const user = await this.userService.findById(currentUser.id, true, true, true);
//                 if (!user) {
//                     throw new Error("Invalid authorization token");
//                 }
//                 return user;
//             }
//         } catch (error) {
//             logger.error(`Error authenticating user. ${error}`);
//             socket.disconnect();
//             return;
//         }

//     }

//     private async handleJoin(socket: Socket, data: { room: number, user: any }) {
//         const roomId: string = data?.room?.toString();
//         if (!roomId) {
//             logger.error('roomId not found');
//             return;
//         }
//         socket.join(roomId);
//         const messages = await this.messageService.findByChatRoomId(data.room);
//         socket.emit(e.fetch_messages, messages);
//     }

//     private async handleSendMessage(_socket: Socket, data: { room: number, message: any }) {
//         const roomId: string = data?.room?.toString();
//         if (roomId) {
//             try {
//                 const message = await this.messageService.newMessage({
//                     content: data.message.content,
//                     chat_room_id: data.room,
//                     user_id: data.message.author,
//                 });

//                 this.io.to(roomId).emit(e.fetched_messages, message);

//                 const receiver = message.chat_room.users.find((user: any) => user.id !== data.message.author);
//                 const isCurrentlyUserConnected = await this.isCurrentlyUserConnected(roomId, receiver.id);
//                 if (!isCurrentlyUserConnected) {
//                     logger.info(`Sending email notification to ${receiver.email}`);
//                 }

//             } catch (error) {
//                 logger.error(`Error sending message. ${error}`);
//             }
//         }
//     }

//     private async handleTypingMessage(_socket: Socket, data: any) {
//         const roomId: string = data?.room?.toString();
//         if (!roomId) {
//             logger.error('roomId not found');
//             return;
//         }
//         this.io.to(roomId).emit(e.typing, data);
//     }

//     private async handleUpdatePeerId(socket: Socket, peerId: string, user: any) {
//         const userId = user?.id?.toString();
//         if (!peerId || !userId) {
//             logger.error('set peerId or userId : peerId or userId not found');
//             return;
//         }
//         this.peers.set(userId, peerId);
//         await this.userService.updatePeerId(userId, peerId);
//         return;
//     }

//     private async handleConnectedUsers(roomId: string, user: any, append: boolean = true) {
//         if (!this.connectedUsers[roomId]) {
//             this.connectedUsers[roomId] = new Set();
//         }

//         if (append) {
//             this.connectedUsers[roomId].add(user);
//         } else {
//             this.connectedUsers[roomId].delete(user);
//         }
//     }

//     private async isCurrentlyUserConnected(roomId: string, user: any) {
//         return this.connectedUsers[roomId]?.has(user);
//     }

//     private async handleSendAttachment(_socket: Socket, data: { room: number, attachment: any }) {
//         const roomId: string = data?.room?.toString();
//         if (roomId) {
//             try {

//                 const attachment: IMessageAttachment = {
//                     filename: data.attachment.file.name,
//                     mimeType: data.attachment.file.type,
//                     filePath: data.attachment.file.data
//                 }

//                 const message = await this.messageService.newMessage({
//                     content: data.attachment.content,
//                     chat_room_id: data.room,
//                     user_id: data.attachment.author,
//                     attachments: [attachment]
//                 });

//                 this.io.to(roomId).emit(e.fetched_messages, message);

//                 // this.io.to(roomId).emit(e.fetched_attachment, {});
//             } catch (error) {
//                 logger.error(`Error sending attachment. ${error}`);
//             }
//         }
//     }
// }
