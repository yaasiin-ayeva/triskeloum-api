import {
    Entity,
    Column,
    Index,
} from "typeorm";
import BaseModel from "./Base.model";

@Entity("emails")
export class Email extends BaseModel {

    @Index()
    @Column({ type: "varchar", nullable: false })
    sender: string;

    @Index()
    @Column({ type: "varchar", nullable: false })
    recipient: string;

    @Column({ type: "varchar", nullable: false })
    subject: string;

    @Column({ type: "text", nullable: false })
    body: string;

    @Index()
    @Column({ type: "boolean", default: false })
    isSent: boolean;

    constructor(email: Partial<Email>) {
        super();
        Object.assign(this, email);
    }
}
