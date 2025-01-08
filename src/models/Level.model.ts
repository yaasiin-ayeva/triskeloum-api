import { Column, Entity, OneToMany } from "typeorm";
import BaseModel from "./Base.model";
import { User } from "./User.model";
import { Course } from "./Course.model";

@Entity("levels")
export class Level extends BaseModel {

    @Column({ type: "int", nullable: false, unique: true })
    rank: number;

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    name: string;

    @OneToMany(() => User, (user) => user.level)
    users: User[];

    @OneToMany(() => Course, (course) => course.level)
    courses: Course[];

    constructor(level: Partial<Level>) {
        super();
        Object.assign(this, level);
    }
}