import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import BaseModel from "../Base.model";
import { User } from "../User.model";
import { Attachment } from "./Attachment.model";
import { Room } from "./Room.model";
import { AppDataSource } from "../../config/database.config";

@Entity("messages")
export class Message extends BaseModel {

    @Index()
    @Column({
        "type": "text",
        default: "",
        nullable: false
    })
    content: string;

    @ManyToOne(() => User, (user) => user.messages, {
        onDelete: "SET NULL"
    })
    user: User

    @Column({
        type: "timestamp",
        nullable: true
    })
    seenAt: Date

    @Column({
        type: "timestamp",
        nullable: true
    })
    deliveredAt: Date

    @Column({
        type: "timestamp",
        nullable: true
    })
    editedAt: Date

    @ManyToOne(() => Room, {
        onDelete: "CASCADE"
    })
    room: Room

    @OneToMany(() => Attachment, (attachment) => attachment.message)
    attachments: Attachment[]

    @ManyToOne(() => Message, (message) => message.replies, {
        onDelete: "SET NULL"
    })
    repliedTo: Message

    @OneToMany(() => Message, (message) => message.repliedTo)
    replies: Message[]

    constructor(message: Partial<Message>) {
        super();
        Object.assign(this, message);
    }

    static getDatasource() {
        if (!AppDataSource.isInitialized) {
            AppDataSource.initialize();
        }
        if (AppDataSource.isInitialized) {
            return AppDataSource.getRepository(Message);
        }
        return AppDataSource.getRepository(Message);
    }

    static async getOneByIdWithRelations(messageId: number, arg1: string[]) {
        return await Message.getDatasource().findOne({
            where: { id: messageId },
            relations: arg1
        });
    }
}

