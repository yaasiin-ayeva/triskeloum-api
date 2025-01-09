import * as bcrypt from 'bcrypt';
import BaseModel from "./Base.model";
import { BeforeInsert, Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import { ROLE } from '../types/enums';
import { Level } from './Level.model';
import { Token } from './Token.model';

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

    @OneToMany(() => Token, (token) => token.user)
    tokens: Token[];

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

    public getInfo() {
        const allowedListData: any = {};
        for (const field of User.allowedFields) {
            allowedListData[field] = this[field];
        }
        return allowedListData;
    }

    constructor(user: Partial<User>) {
        super();
        Object.assign(this, user);
    }
}