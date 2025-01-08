import * as bcrypt from 'bcrypt';
import * as jwt from "jsonwebtoken";
import { SignupDto, LoginDto, ForgotPasswordDto } from "../dtos/auth.dto";
import { User } from "../models/User.model";
import { ENVIRONMENT, ROLE } from "../types/enums";
import ErrorResponse from "../utils/errorResponse.util";
import BaseService from "./Base.service";
import { awaiter } from "../utils/core.util";
import EnvConfig from '../config/environment.config';
import LevelService from './Level.service';
const crypto = require('crypto');

export default class UserService extends BaseService<User> {

    private static instance: UserService;

    constructor() {
        if (UserService.instance) {
            return UserService.instance;
        } else {
            super(User);
            UserService.instance = this;
        }
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

    public async signup(data: SignupDto) {

        try {

            if (await User.isEmailTaken(data.email)) {
                throw new ErrorResponse('Email already taken', 409);
            }

            if (await User.isPhoneTaken(data.phone)) {
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

            if (await user.passwordMatches(data.password)) {
                const token = await UserService.signToken(user, data.remember);
                await user.updateLastLogin();
                user.last_login = new Date();
                return { token, data: user.getInfo() };
            }

            throw new ErrorResponse('Incorrect email or password', 401);
        }
    }

    public async signout() {
        // No need to do anything, stateless server, client side implementation
        // TODO but can update last login of the user or last seen for future improvements
        return true;
    }

    public async forgotPassword(data: ForgotPasswordDto) {

        const user = await this.repo.createQueryBuilder("users")
            .where("users.email = :email", { email: data.email })
            .getOne();

        if (!user) {
            throw new ErrorResponse('There is no user with such email', 404);
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const resetPasswordExpire = Date.now() + EnvConfig.ACCESS_TOKEN_DURATION;

        await this.repo.update(user.id, {
            reset_password_token: resetPasswordToken,
            reset_password_expire: new Date(resetPasswordExpire)
        });

        return { user, resetToken };
    }

    public async updateUserInfo(userData: { first_name: string, last_name: string, email: string, phone: string }, id: number) {
        let user = await this.repo.createQueryBuilder("users")
            .where("users.id = :id", { id: id })
            .getOne();

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        if (userData.email !== user.email && await User.isEmailTaken(userData.email)) {
            throw new ErrorResponse('Email already taken', 409);
        }

        if (userData.phone !== user.phone && await User.isPhoneTaken(userData.phone)) {
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

        if (!(await user.passwordMatches(oldPassword))) {
            throw new ErrorResponse('Old password is incorrect', 400);
        }

        const saltRounds = 12;
        user.password = await bcrypt.hash(newPassword, saltRounds);
        user.reset_password_token = null;
        user.reset_password_expire = null;

        const update = await this.repo.update(user.id, user);

        if (!update || !update.affected || update.affected < 1) {
            throw new ErrorResponse('Password update failed', 400);
        }

        return user.getInfo();
    }

    public async resetPassword(token: string, newPassword: string) {

        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await this.repo.createQueryBuilder("users")
            .where("users.reset_password_token = :token", { token: resetPasswordToken })
            .andWhere("users.reset_password_expire > :now", { now: new Date() })
            .getOne();

        if (!user) {
            throw new ErrorResponse('Access token is invalid or has expired', 400);
        }

        const saltRounds = 12;
        user.password = await bcrypt.hash(newPassword, saltRounds);
        user.reset_password_token = null;
        user.reset_password_expire = null;

        const update = await this.repo.update(user.id, user);

        if (!update || !update.affected || update.affected < 1) {
            throw new ErrorResponse('Password reset failed', 400);
        } else {
            const token = await UserService.signToken(user);
            await user.updateLastLogin();
            return { token, data: user.getInfo() };
        }
    }

    private static async signToken(user: User, remember: boolean = false) {

        const whitelist: string[] = user.whitelist;
        const token_data: { [key: string]: any } = {};

        Object.keys(user).forEach(key => {
            if (whitelist.includes(key)) {
                token_data[key] = user[key];
            }
        });

        const expiresIn = remember ? EnvConfig.JWT_REMEMBER_ME_EXPIRE : (EnvConfig.env === ENVIRONMENT.production ? EnvConfig.JWT_PROD_EXPIRE : EnvConfig.JWT_DEV_EXPIRE);
        return jwt.sign(token_data, EnvConfig.JWT_KEY, {
            algorithm: "HS512",
            expiresIn
        });
    }
}