import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import swaggerUi = require('swagger-ui-express');
import { AppDataSource } from "./config/database.config";
import EnvConfig from "./config/environment.config";
import logger from "./config/logger.config";
import morganConfig from "./config/morgan.config";
import swaggerSpec from "./config/swagger.config";

import express = require("express");
import http = require('http');
import { scheduleCrons } from "./crons/index.cron";
import corsMiddleware from "./middlewares/cors.middleware";
import apiRouter from "./routes/index.route";
import { runSeeders } from "./seeders/index.seeder";
import { ENVIRONMENT } from "./types/enums";
import { verifySmtpConnection } from "./config/providers.config";

const compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');
import publicContent from '../app.json';
import SocketHandler from "./sockets/socket-handler.sockets";
import PeerServerService from "./services/PeerServer.service";
const PORT = EnvConfig.API_PORT;

const app = express();
const server = http.createServer(app);

const apiLimiter = rateLimit({
    windowMs: EnvConfig.WINDOWS_MS,
    max: EnvConfig.MAX,
    standardHeaders: EnvConfig.STANDARD_HEADERS,
    legacyHeaders: EnvConfig.LEGACY_HEADERS,
});

app.use(morganConfig.successHandler);
app.use(morganConfig.errorHandler);

app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(compression());

if (EnvConfig.env === ENVIRONMENT.production) {
    app.use(apiLimiter);
}

app.disable("x-powered-by");
app.use(`/${EnvConfig.PUBLIC_PATH}`, corsMiddleware, express.static(EnvConfig.PUBLIC_PATH));

app.use('/api', apiRouter);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.get('/', (_, res) => {
    res.send(publicContent);
});

new SocketHandler(server);
// const peerService = new PeerServerService(server);
// app.use('/peerjs', peerService.getPeerServer());

app.use((error: any, req: Request, res: Response, _next: any) => {
    let statusCode = error.statusCode || 500;
    let errorMessage = statusCode === 500 ? 'Internal Server Error' : error.message;
    let stack = isNaN(Number(error.statusCode)) ? error.stack : null;

    logger.error(`Error ${statusCode}: ${errorMessage} ${stack ? 'Stack' + stack : ''}`, { url: req.url, method: req.method });

    if (EnvConfig.env === ENVIRONMENT.development) {
        console.log(error);
    }

    return res.status(statusCode).json({
        success: false,
        error: errorMessage,
        payload: error.payload || null
    });
});

AppDataSource.initialize().then(async () => {
    logger.info('Datasource initialized successfully');

    await runSeeders();

    scheduleCrons();

    server.listen(PORT, () => {
        logger.info(`${EnvConfig.API_NAME} has been successfully started on port ${PORT} in ${EnvConfig.env} mode`);
    });

    await verifySmtpConnection();

}).catch((error => {
    logger.error(`Datasource Error: ${error.message}`);
}));