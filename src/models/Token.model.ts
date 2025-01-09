import { Entity, Column, ManyToOne } from "typeorm";
import BaseModel from "./Base.model";
import { User } from "./User.model";
import { TOKEN_TYPE } from "../types/enums";

@Entity("tokens")
export class Token extends BaseModel {

    @Column({
        type: "enum",
        nullable: false,
        enum: TOKEN_TYPE
    })
    type: TOKEN_TYPE;

    @Column({ type: "varchar", nullable: false })
    token: string;

    @Column({ type: "timestamp", nullable: false })
    expires_at: Date;

    @Column({ type: "boolean", default: true })
    is_valid: boolean;

    @ManyToOne(() => User, (user) => user.tokens)
    user: User;

    constructor(token: Partial<Token>) {
        super();
        Object.assign(this, token);
    }
}