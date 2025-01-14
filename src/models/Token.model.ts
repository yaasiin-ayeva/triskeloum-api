import { Entity, Column, ManyToOne, Index } from "typeorm";
import BaseModel from "./Base.model";
import { User } from "./User.model";
import { TOKEN_TYPE } from "../types/enums";

@Entity("tokens")
export class Token extends BaseModel {

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

    constructor(token: Partial<Token>) {
        super();
        Object.assign(this, token);
    }
}