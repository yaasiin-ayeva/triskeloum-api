import { Column, Entity, OneToMany } from "typeorm";
import BaseModel from "./Base.model";
import { Course } from "./Course.model";

@Entity("categories")
export class Category extends BaseModel {

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    title: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    cover: string;

    @OneToMany(() => Course, (course) => course.category)
    courses: Course[];

    constructor(category: Partial<Category>) {
        super();
        Object.assign(this, category);
    }
}