const morgan = require('morgan');
import logger from './logger.config';
import EnvConfig from "./environment.config";

const format = EnvConfig.LOGS_TOKEN;

const successHandler = morgan(format, {
    skip: (req: any, res: any) => res.statusCode >= 400,
    stream: { write: (message: string) => logger.info(message.trim()) },
});

const errorHandler = morgan(format, {
    skip: (_req: any, res: any) => res.statusCode < 400,
    stream: { write: (message: string) => logger.error(message.trim()) },
});

export default {
    successHandler,
    errorHandler
};