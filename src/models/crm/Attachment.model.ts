import { Column, Entity, ManyToOne } from "typeorm";
import BaseModel from "../Base.model";
import { Message } from "./Message.model";

@Entity("attachments")
export class Attachment extends BaseModel {

    @Column({ type: "varchar", nullable: false })
    filename: string

    @Column({ type: "varchar", nullable: false })
    path: string

    @Column({ type: "varchar", nullable: false })
    mimetype: string

    @ManyToOne(() => Message, (message) => message.attachments)
    message: Message;

    constructor(attachment: Partial<Attachment>) {
        super();
        Object.assign(this, attachment);
    }
}