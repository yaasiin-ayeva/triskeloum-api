import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import EnvConfig from "../config/environment.config";
import ErrorResponse from "../utils/errorResponse.util";
import UserService from "../services/User.service";

const MISSING_AUTHORIZATION_TOKEN = "Missing authorization token";
const UNAUTHORIZED_USER = "Unauthorized user!";
const INVALID_AUTHORIZATION_TOKEN = "Invalid authorization token";

const userService: UserService = new UserService();

const createAuthMiddleware = (required: boolean = true) => {
    return async (req: any, _res: Response, next: NextFunction) => {
        try {
            let token: string | undefined;

            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            } else if (req.cookies.token) {
                token = req.cookies.token;
            }

            if (!token) {
                if (required) {
                    return next(new ErrorResponse(MISSING_AUTHORIZATION_TOKEN, 401));
                }
                return next();
            }

            jwt.verify(token, EnvConfig.JWT_KEY, async (error: any, decodedToken: any) => {
                if (error) {
                    if (required) {
                        return next(new ErrorResponse(UNAUTHORIZED_USER, 401));
                    }
                    return next();
                }

                const tokenId = decodedToken?.id;

                if (!tokenId) {
                    if (required) {
                        return next(new ErrorResponse(INVALID_AUTHORIZATION_TOKEN, 401));
                    }
                    return next();
                }

                try {
                    let user = await userService.findById(tokenId);

                    if (!user) {
                        if (required) {
                            return next(new ErrorResponse(INVALID_AUTHORIZATION_TOKEN, 401));
                        }
                        return next();
                    }

                    req.user = user.getInfo();
                    return next();
                } catch (error) {
                    if (required) {
                        return next(new ErrorResponse(error.message, 500));
                    }
                    return next();
                }
            });
        } catch (error) {
            if (required) {
                return next(new ErrorResponse(INVALID_AUTHORIZATION_TOKEN, 401));
            }
            return next();
        }
    };
};

export const authMiddleware = createAuthMiddleware(true);
export const optionalAuthMiddleware = createAuthMiddleware(false);
