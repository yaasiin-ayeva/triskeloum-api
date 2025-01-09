import UserService from "../services/User.service";
import { NextFunction, Request, Response } from "express";
import { EMAIL_EVENTS } from "../types/enums";
import ErrorResponse from "../utils/errorResponse.util";
import authValidation from "../validations/auth.validation";
import { BaseController } from "./Base.controller";
import EnvConfig from "../config/environment.config";
import logger from "../config/logger.config";
import { SignupDto } from "../dtos/auth.dto";
import { emailEmitter } from "../types/events/email.event";
import LevelService from "../services/Level.service";

export default class UserController extends BaseController<UserService> {

    private readonly _levelService: LevelService;

    constructor() {
        super(new UserService(), 'user');
        this._levelService = new LevelService();
    }

    public getLevelsHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this._levelService.findAll();
            return this.apiResponse(res, 200, "Levels fetched successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public getUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.service.getAllUsers();
            return this.apiResponse(res, 200, "Users fetched successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public loginHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {

            this.validateRequestArgs(req, authValidation.login);
            const data = await this.service.login(req.body);
            return this.apiResponse(res, 200, "User successfully logged in", data);

        } catch (e) {
            next(e);
        }
    }

    public signupHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {

            this.validateRequestArgs(req, authValidation.signup);
            const payload = new SignupDto();
            Object.assign(payload, req.body);
            const data = await this.service.signup(payload);

            try {
                emailEmitter.emit(EMAIL_EVENTS.user_register, { email: data.email, firstname: data.firstname, lastname: data.lastname });
            } catch (err) {
                logger.error(err);
            }

            const loginData = await this.service.login({ email: data.email, password: req.body.password });
            return this.apiResponse(res, 200, "User successfully registered", loginData);

        } catch (error) {
            next(error);
        }
    }

    public refreshTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refresh_token } = req.body;
            if (!refresh_token || refresh_token.length === 0) {
                throw new ErrorResponse('Refresh token is required', 400);
            }

            const data = await this.service.refreshToken(refresh_token);
            return this.apiResponse(res, 200, "Token refreshed successfully", data);
        } catch (error) {
            next(error);
        }
    }

    public signoutHandler = async (_, res: Response, next: NextFunction) => {
        try {

            return this.apiResponse(res, 200, "User successfully logged out", {});

        } catch (e) {
            next(new ErrorResponse(e.message, 500));
        }
    }

    public updatePasswordHandler = async (req: any, res: Response, next: NextFunction) => {
        try {
            this.validateRequestArgs(req, authValidation.updatePassword);
            const data = await this.service.updatePassword(req.body.new_password, req.body.old_password, req.user.email);
            return this.apiResponse(res, 200, "Password updated successfully", data);
        } catch (error) {
            next(error);
        }
    }

    public updateUserInfoHandler = async (req: any, res: Response, next: NextFunction) => {
        try {
            this.validateRequestArgs(req, authValidation.updateUserInfo);
            const data = await this.service.updateUserInfo(req.body, req.user.id);
            return this.apiResponse(res, 200, "User info updated successfully", data);
        } catch (error) {
            next(error);
        }
    }

    public forgotPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {

            this.validateRequestArgs(req, authValidation.forgotPassword);

            const { user, resetToken } = await this.service.forgotPassword(req.body);
            const resetUrl = `${EnvConfig.RESET_PASSWORD_CLIENT_URL}/${resetToken}`;

            if (!user || !resetToken || !user.email) {
                return this.apiResponse(res, 400, "Unable to send email to reset password, user not found.", null);
            }

            try {
                emailEmitter.emit(EMAIL_EVENTS.user_forgot_passwd, user, resetUrl);
            } catch (err) {
                logger.error(err);
            }

            return this.apiResponse(res, 200, "You will receive an email with reset instructions", null);

        } catch (e) {
            next(e);
        }
    }

    public resetPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {

            this.validateRequestArgs(req, authValidation.resetPassword);
            const token = req.params?.token;

            if (!token || token.length === 0) {
                throw new ErrorResponse('Access token is required', 400);
            }
            const data = await this.service.resetPassword(token, req.body.new_password);

            try {

                emailEmitter.emit(EMAIL_EVENTS.user_reset_passwd, data.data);

            } catch (err) {
                logger.error(err);
            }

            return this.apiResponse(res, 200, "Password reset successfully", data);
        } catch (error) {
            next(error);
        }
    }
}