import { Column, Entity, ManyToOne } from "typeorm";
import BaseModel from "./Base.model";
import { Course } from "./Course.model";

@Entity("sections")
export class Section extends BaseModel {

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    title: string;

    @ManyToOne(() => Course, (course) => course.sections)
    course: Course;

    @Column({ type: "int", nullable: false })
    order: number;

    @Column({ type: "json", nullable: false })
    content: {
        cover: string,
        summary: string,
        parts: { title: string, content: string }[]
    }

    constructor(section: Partial<Section>) {
        super();
        Object.assign(this, section);
    }
}