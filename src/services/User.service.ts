import * as bcrypt from 'bcrypt';
import * as jwt from "jsonwebtoken";
import { SignupDto, LoginDto, ForgotPasswordDto } from "../dtos/auth.dto";
import { User } from "../models/User.model";
import { ENVIRONMENT, ROLE, TOKEN_TYPE } from "../types/enums";
import ErrorResponse from "../utils/errorResponse.util";
import BaseService from "./Base.service";
import { awaiter } from "../utils/core.util";
import EnvConfig from '../config/environment.config';
import LevelService from './Level.service';
import { Session } from '../models/Session.model';
import SessionService from './Session.service';

const crypto = require('crypto');
import ms from "ms";

export default class UserService extends BaseService<User> {

    private static instance: UserService;
    private static sessionService: SessionService;

    constructor() {
        if (UserService.instance) {
            return UserService.instance;
        }
        super(User);
        UserService.instance = this;
        UserService.sessionService = SessionService.getInstance();
    }

    public async searchUsers(query: string) {
        if (!query || query.length > 100) {
            return [];
        }

        const sanitizedQuery = query.replace(/[^a-zA-Z0-9@. ]/g, '');

        const searchFields = ['email', 'phone', 'firstname', 'lastname']
            .filter(field => User.allowedFields.includes(field))
            .map(field => `users.${field}`);

        return await this.repo.createQueryBuilder("users")
            .select(User.allowedFields.map(field => `users.${field}`))
            .where(searchFields.map(field => `${field} ILIKE :query`).join(' OR '),
                { query: `%${sanitizedQuery}%` })
            .getMany();
    }

    public async findById(id: number) {
        return await this.repo
            .createQueryBuilder('users')
            .leftJoinAndSelect('users.level', 'level')
            .where('users.id = :id', { id }).getOne();
    }

    public async findByEmail(email: string) {
        return await this.repo.createQueryBuilder("users")
            .leftJoinAndSelect('users.level', 'level')
            .where("users.email = :email", { email: email })
            .getOne();
    }

    public async getAllUsers() {
        const userFields = User.allowedFields.map(field => `users.${field}`);
        const levelFields = ['level.name', 'level.rank', 'level.id'];
        return await this.repo.createQueryBuilder("users")
            .leftJoinAndSelect('users.level', 'level')
            .select([...userFields, ...levelFields])
            .getMany();
    }

    public async signup(data: SignupDto) {

        try {

            if (await this.isEmailTaken(data.email)) {
                throw new ErrorResponse('Email already taken', 409);
            }

            if (await this.isPhoneTaken(data.phone)) {
                throw new ErrorResponse('Phone already taken', 409);
            }

            const levelService = new LevelService();

            const userLevel = await levelService.findById(data.level);
            if (!userLevel) {
                throw new ErrorResponse('Invalid level', 400);
            }

            const userData = new User({
                email: data.email,
                phone: data.phone,
                password: data.password,
                firstname: data.firstname,
                lastname: data.lastname,
                level: userLevel,
                role: ROLE.user
            });

            let user = await this.repo.save(userData);
            return user.getInfo();

        } catch (error) {
            throw error;
        }
    }

    public async login(data: LoginDto) {

        const user = await this.repo.createQueryBuilder("users")
            .leftJoinAndSelect("users.level", "level")
            .where("users.email = :email", { email: data.email })
            .getOne();

        if (!user) {
            await awaiter();
            throw new ErrorResponse('User Not found', 404);
        } else {

            if (await this.passwordMatches(data.password, user.password)) {

                const accessToken = await this.generateAccessToken(user, data.remember);
                const refreshToken = await this.generateRefreshToken(user);
                await this.updateLastLogin(user);

                return {
                    token: accessToken.token,
                    refreshToken: refreshToken.token,
                    data: user.getInfo()
                };
            }

            throw new ErrorResponse('Incorrect email or password', 401);
        }
    }

    private async updateLastLogin(user: User) {
        return await this.repo.update(user.id, { last_login: new Date() });
    }

    private async generateAccessToken(user: User, keepAlive: boolean = false): Promise<Session> {
        const whitelist: string[] = User.allowedFields;
        const token_data: { [key: string]: any } = {};

        Object.keys(user).forEach(key => {
            if (whitelist.includes(key)) {
                token_data[key] = user[key];
            }
        });

        const expiresIn = keepAlive
            ? EnvConfig.JWT_REMEMBER_ME_EXPIRE
            : EnvConfig.env === ENVIRONMENT.production
                ? EnvConfig.JWT_PROD_EXPIRE
                : EnvConfig.JWT_DEV_EXPIRE;

        const tokenString = jwt.sign(token_data, EnvConfig.JWT_KEY, {
            algorithm: "HS512",
            expiresIn,
        });

        const expires_at = new Date(Date.now() + ms(expiresIn));

        return await UserService.sessionService.createSession({
            token: tokenString,
            type: TOKEN_TYPE.access,
            expires_at: expires_at,
            user: user,
        });
    }

    private async generateRefreshToken(user: User, duration: number = EnvConfig.REFRESH_TOKEN_DURATION) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + new Date(duration).getDate());

        const tokenString: string = TOKEN_TYPE.refresh.toLowerCase() + '-' + crypto.randomBytes(24).toString('hex');

        return await UserService.sessionService.createSession({
            token: tokenString,
            type: TOKEN_TYPE.refresh,
            expires_at: expiresAt,
            user: user.getInfo()
        });
    }

    public async signout() {
        // TODO : invalidate current session 
        return true;
    }

    public async forgotPassword(data: ForgotPasswordDto) {

        const user = await this.repo.createQueryBuilder("users")
            .where("users.email = :email", { email: data.email })
            .getOne();

        if (!user) {
            throw new ErrorResponse('User Not found', 404);
        }

        const tokenString = crypto.randomBytes(20).toString('hex');
        const expires_at = new Date(Date.now() + EnvConfig.PWD_RESET_ACCESS_TOKEN_DURATION);

        const resetToken: Session = await UserService.sessionService.createSession({
            token: tokenString,
            type: TOKEN_TYPE.reset_password,
            expires_at: expires_at,
            user: user
        });
        return { user, resetToken: resetToken.token };
    }

    public async refreshToken(refreshToken: string) {

        const session = await UserService.sessionService.getSession(refreshToken, TOKEN_TYPE.refresh, false, true, true);

        if (!session) {
            throw new ErrorResponse('Invalid refresh token', 401);
        }

        if (new Date() > session.expires_at) {
            session.is_valid = false;
            await UserService.sessionService.update(session.id, session);
            throw new ErrorResponse('Refresh token expired', 401);
        }

        const accessToken = await this.generateAccessToken(session.user);
        return {
            token: accessToken.token,
            refreshToken: refreshToken
        };
    }

    public async updateUserInfo(userData: { first_name: string, last_name: string, email: string, phone: string }, id: number) {
        let user = await this.repo.createQueryBuilder("users")
            .where("users.id = :id", { id: id })
            .getOne();

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        if (userData.email !== user.email && await this.isEmailTaken(userData.email)) {
            throw new ErrorResponse('Email already taken', 409);
        }

        if (userData.phone !== user.phone && await this.isPhoneTaken(userData.phone)) {
            throw new ErrorResponse('Phone already taken', 409);
        }

        user.firstname = userData.first_name;
        user.lastname = userData.last_name;
        user.email = userData.email;
        user.phone = userData.phone;

        const update = await this.repo.update(user.id, user);

        if (!update || !update.affected || update.affected < 1) {
            throw new ErrorResponse('User update failed', 400);
        }
        return user.getInfo();
    }

    public async updatePassword(newPassword: string, oldPassword: string, email: string) {
        const user = await this.repo.createQueryBuilder("users")
            .where("users.email = :email", { email: email })
            .getOne();

        if (!user) {
            throw new ErrorResponse('There is no user with that email', 404);
        }

        if (!(await this.passwordMatches(oldPassword, user.password))) {
            throw new ErrorResponse('Old password is incorrect', 400);
        }

        const saltRounds = 12;
        user.password = await bcrypt.hash(newPassword, saltRounds);
        const update = await this.repo.update(user.id, user);

        if (!update || !update.affected || update.affected < 1) {
            throw new ErrorResponse('Password update failed', 400);
        }

        return user.getInfo();
    }

    public async resetPassword(tokenString: string, newPassword: string) {

        const resetToken = await UserService.sessionService.getSession(tokenString, TOKEN_TYPE.reset_password, false, true, true);

        if (!resetToken) {
            throw new ErrorResponse('Access token is invalid or has expired', 400);
        }

        const saltRounds = 12;
        const user = resetToken.user;
        user.password = await bcrypt.hash(newPassword, saltRounds);
        const update = await this.repo.update(user.id, user);
        await UserService.sessionService.invalidateSession(resetToken);

        if (!update || !update.affected || update.affected < 1) {
            throw new ErrorResponse('Password reset failed', 400);
        } else {

            const accessToken = await this.generateAccessToken(user, false);
            const refreshTokenString = await this.generateRefreshToken(user);
            await this.updateLastLogin(user);

            return {
                token: accessToken.token,
                refreshToken: refreshTokenString,
                data: user.getInfo()
            };
        }
    }

    private async passwordMatches(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainTextPassword, hashedPassword);
    }

    private async isEmailTaken(email: string): Promise<boolean> {
        const user = await this.repo.createQueryBuilder("users")
            .where("users.email = :email", { email })
            .getOne();
        return !!user;
    }

    private async isPhoneTaken(phone: string): Promise<boolean> {
        const user = await this.repo.createQueryBuilder("users")
            .where("users.phone = :phone", { phone })
            .getOne();
        return !!user;
    }

    public async isUserExists(email: string, phone: string): Promise<boolean> {
        const user = await this.repo.findOne({ where: { email, phone } });
        return !!user;
    }
}