import EnvConfig from "../config/environment.config";
import { ENVIRONMENT } from "../types/enums";
import ErrorResponse from "../utils/errorResponse.util";

const cors = require('cors');

const corsAllowedOrigins = EnvConfig.AUTHORIZED;

export const corsOptions = {
    origin: EnvConfig.env === ENVIRONMENT.development ? "*" : function (origin: any, callback: any) {        
        if (corsAllowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new ErrorResponse('Not allowed by CORS', 403));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
}


const corsMiddleware = async (req: any, res: any, next: any) => {

    // if (EnvConfig.env === ENVIRONMENT.development) {
        return await cors()(req, res, next);
    // }

    await cors(corsOptions)(req, res, next);
}

export default corsMiddleware