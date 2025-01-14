import { Column, Entity, Index, OneToMany } from "typeorm";
import BaseModel from "./Base.model";
import { User } from "./User.model";
import { Course } from "./Course.model";

@Entity("levels")
export class Level extends BaseModel {

    @Index({ unique: true })
    @Column({ type: "int", nullable: false, unique: true })
    rank: number;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    name: string;

    @OneToMany(() => User, (user) => user.level)
    users: User[];

    @OneToMany(() => Course, (course) => course.level)
    courses: Course[];

    @Column({ type: "boolean", nullable: false, default: false })
    is_public: boolean;

    courses_count?: number;

    users_count?: number;

    constructor(level: Partial<Level>) {
        super();
        Object.assign(this, level);
    }
}