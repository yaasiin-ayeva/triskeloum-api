import { Column, Entity, ManyToOne } from "typeorm";
import BaseModel from "../Base.model";
import { User } from "../User.model";
import { Room } from "./Room.model";
import { AppDataSource } from "../../config/database.config";


@Entity("calls")
export class Call extends BaseModel {

    @ManyToOne(() => Room, (room) => room.calls, {
        onDelete: "CASCADE"
    })
    room: Room

    @ManyToOne(() => User, (user) => user.calls, {
        onDelete: "SET NULL"
    })
    user: User

    @Column({ type: "boolean", default: false })
    isVideo: boolean

    @Column({ type: "numeric", nullable: true, default: null })
    durationMin: number

    constructor(call: Partial<Call>) {
        super();
        Object.assign(this, call);
    }

    static getDatasource() {
        if (!AppDataSource.isInitialized) {
            AppDataSource.initialize();
        }
        if (AppDataSource.isInitialized) {
            return AppDataSource.getRepository(Call);
        }
        return AppDataSource.getRepository(Call);
    }
}