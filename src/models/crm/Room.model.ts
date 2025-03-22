import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import BaseModel from "../Base.model";
import { User } from "../User.model";
import { Message } from "./Message.model";
import { Call } from "./Call.model";
import { AppDataSource } from "../../config/database.config";


@Entity("rooms")
export class Room extends BaseModel {

    @Column({
        type: "varchar",
        nullable: false,
        default: `Room ${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`
    })
    name: string

    @ManyToMany(() => User, {
        onDelete: "CASCADE"
    })
    @JoinTable({
        name: "room_users",
        joinColumn: {
            name: "room_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "user_id",
            referencedColumnName: "id"
        }
    })
    users: User[]

    @OneToMany(() => Message, (message) => message.room, {
        cascade: true,
        eager: true
    })
    messages: Message[]

    @OneToMany(() => Call, (call) => call.room, {
        cascade: true,
        eager: true
    })
    calls: Call[]

    @Column({
        type: "boolean",
        nullable: false,
        default: false
    })
    isDraft: boolean

    constructor(room: Partial<Room>) {
        super();
        Object.assign(this, room);
    }

    static getDatasource() {
        if (!AppDataSource.isInitialized) {
            AppDataSource.initialize();
        }
        if (AppDataSource.isInitialized) {
            return AppDataSource.getRepository(Room);
        }
        return AppDataSource.getRepository(Room);
    }

    static async getOneByIdWithRelations(id: number, arg1: string[]) {
        return await Room.getDatasource().findOne({
            where: { id: id },
            relations: arg1
        });
    }
}