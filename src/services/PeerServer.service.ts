import { ExpressPeerServer } from 'peer';
import http from 'http';
import logger from '../config/logger.config';

export default class PeerServerService {
    private server: http.Server;
    private peerServer: any;

    constructor(server: http.Server) {
        this.server = server;
        this.initialize();
    }

    private initialize(): void {
        try {
            this.peerServer = ExpressPeerServer(this.server, {
                path: '/peerjs',
                proxied: true,
                allow_discovery: false
            });

            this.handlePeerEvents();

            logger.info('PeerJS server initialized successfully');
        } catch (error) {
            logger.error(`Error initializing PeerJS server: ${error}`);
        }
    }

    private handlePeerEvents(): void {
        this.peerServer.on('connection', (client: any) => {
            logger.info(`PeerJS client connected: ${client.getId()}`);
        });

        this.peerServer.on('disconnect', (client: any) => {
            logger.info(`PeerJS client disconnected: ${client.getId()}`);
        });

        this.peerServer.on('error', (error: any) => {
            logger.error(`PeerJS server error: ${error}`);
        });
    }

    public getPeerServer(): any {
        return this.peerServer;
    }
}