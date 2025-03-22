import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import http from "http";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";
import SocketEventsHandler from "./events/socket-events.handler";
import logger from "../config/logger.config";
import EnvConfig from "../config/environment.config";

export let socket: Server;

export default class SocketHandler {
    private io: Server;
    private pubClient: any;
    private subClient: any;

    constructor(server: http.Server) {
        this.initializeRedisClients();
        this.initializeSocketServer(server);
        socket = this.io;
        this.initializeMiddleware();
        this.initializeConnectionHandler();
    }

    private initializeRedisClients(): void {
        try {
            this.pubClient = createClient({ url: EnvConfig.REDIS_URL || "redis://localhost:6379" });
            this.pubClient.on("error", (err: any) => logger.error(`Redis Client Error: ${err}`));

            this.subClient = this.pubClient.duplicate();

            // Connect to Redis
            Promise.all([
                this.pubClient.connect(),
                this.subClient.connect()
            ]).then(() => {
                logger.info("Redis clients connected successfully");
            }).catch((err: any) => {
                logger.error(`Redis connection error: ${err}`);
            });
        } catch (error) {
            logger.error(`Error initializing Redis clients: ${error}`);
        }
    }

    private initializeSocketServer(server: http.Server): void {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true
            },
            adapter: createAdapter(this.pubClient, this.subClient)
        });
    }

    private initializeMiddleware(): void {
        this.io.use(async (socket: Socket, next) => {
            try {
                const token = socket.handshake.headers.token as string || socket.handshake.auth.token;

                if (!token) {
                    logger.error("Socket authentication error: No token provided");
                    return next(new Error("Authentication error: No token provided"));
                }

                const decoded = jwt.verify(token, EnvConfig.JWT_KEY as string) as { id: number };
                const user = await User.getById(decoded.id);

                if (!user) {
                    return next(new Error("Authentication error: User not found"));
                }

                // Attach user to socket
                (socket as any).user = user;
                next();
            } catch (error) {
                logger.error(`Socket authentication error: ${error}`);
                next(new Error("Authentication error"));
            }
        });
    }

    private initializeConnectionHandler(): void {
        this.io.on("connection", (socket: Socket) => {
            try {
                const user = (socket as any).user;
                logger.info(`User connected: ${user.id}`);

                new SocketEventsHandler(socket, user);
            } catch (error) {
                logger.error(`Error handling socket connection: ${error}`);
                socket.disconnect();
            }
        });
    }
}