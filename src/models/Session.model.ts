import { Entity, Column, ManyToOne, Index } from "typeorm";
import BaseModel from "./Base.model";
import { User } from "./User.model";
import { TOKEN_TYPE } from "../types/enums";

@Entity("sessions")
export class Session extends BaseModel {

    @Index()
    @Column({
        type: "enum",
        nullable: false,
        enum: TOKEN_TYPE
    })
    type: TOKEN_TYPE;

    @Index()
    @Column({ type: "varchar", nullable: false })
    token: string;

    @Index()
    @Column({ type: "timestamp", nullable: false })
    expires_at: Date;

    @Index()
    @Column({ type: "boolean", default: true })
    is_valid: boolean;

    @ManyToOne(() => User, (user) => user.tokens)
    user: User;

    // @Column({ type: "varchar", nullable: false, length: 16 })
    // ip_address: string;

    // @Column({ type: "varchar", nullable: false })
    // user_agent: string;

    // @Column({ type: "varchar", nullable: false })
    // device_type: string;

    // @Column({ type: "varchar", nullable: false })
    // device_name: string;

    // @Column({ type: "varchar", nullable: false })
    // device_os: string;

    // @Column({ type: "varchar", nullable: false })
    // device_os_version: string;

    // @Column({ type: "varchar", nullable: false })
    // browser_name: string;

    // @Column({ type: "varchar", nullable: false })
    // browser_version: string;

    constructor(token: Partial<Session>) {
        super();
        Object.assign(this, token);
    }
}