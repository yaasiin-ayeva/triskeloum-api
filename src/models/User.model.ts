import * as bcrypt from 'bcrypt';
import BaseModel from "./Base.model";
import { BeforeInsert, Column, Entity, Index, ManyToOne } from "typeorm";
import { AppDataSource } from '../config/database.config';
import { ROLE } from '../types/enums';
import { Level } from './Level.model';

@Entity("users")
export class User extends BaseModel {

    @Column({ type: "varchar", nullable: true })
    picture: string;

    @Column({ type: "varchar", nullable: false })
    firstname: string;

    @Column({ type: "varchar", nullable: false })
    lastname: string;

    @Index({ unique: true })
    @Column({
        type: "varchar",
        unique: true,
        nullable: false,
        length: 128
    })
    email: string;

    @Index({ unique: true })
    @Column({
        type: "varchar",
        unique: true,
        nullable: true,
        length: 128
    })
    phone: string;

    @Column({
        type: "varchar",
        nullable: true,
    })
    password: string;

    @Column({
        type: "varchar",
        nullable: true,
        default: null
    })
    reset_password_token: string;

    @Column({
        type: "timestamp",
        nullable: true,
        default: null
    })
    reset_password_expire: Date;

    @Column({
        type: "timestamp",
        nullable: true,
        default: null
    })
    last_login: Date;

    @Column({
        type: "boolean",
        default: false
    })
    is_pwd_updated: boolean

    @ManyToOne(() => Level, (level) => level.users)
    level: Level

    @Column({
        type: "varchar",
        nullable: false,
        default: ROLE.user
    })
    role: ROLE;

    @BeforeInsert()
    async hashPassword(password: string = this.password) {
        const saltRounds = 12;
        this.password = await bcrypt.hash(password, saltRounds);
        return this.password;
    }

    async updateLastLogin() {
        const userRepository = AppDataSource.getRepository(User);
        await userRepository.update({ id: this.id }, { last_login: new Date() });
    }

    async passwordMatches(plainTextPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainTextPassword, this.password);
    }

    static async isEmailTaken(email: string): Promise<boolean> {
        const user = await AppDataSource.getRepository(User).findOne({ where: { email } });
        return !!user;
    }

    static async isUserExists(email: string, phone: string): Promise<boolean> {
        const user = await AppDataSource.getRepository(User).findOne({ where: { email, phone } });
        return !!user;
    }

    static async isPhoneTaken(phone: string): Promise<boolean> {
        const user = await AppDataSource.getRepository(User).findOne({ where: { phone } });
        return !!user;
    }

    static allowedFields = [
        'id',
        'picture',
        'firstname',
        'lastname',
        'email',
        'role',
        'level',
        'last_login',
        'created_at',
        'updated_at',
        'is_pwd_updated'
    ];

    get whitelist(): string[] {
        return User.allowedFields;
    }

    public getInfo() {
        const whitelistedData: any = {};
        for (const field of this.whitelist) {
            whitelistedData[field] = this[field];
        }
        return whitelistedData;
    }

    constructor(user: Partial<User>) {
        super();
        Object.assign(this, user);
    }
}