import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import BaseModel from "./Base.model";
import { SectionContent } from "./SectionContent.model";
import { Course } from "./Course.model";

@Entity("sections")
export class Section extends BaseModel {

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    title: string;

    @ManyToOne(() => Course, (course) => course.sections)
    course: Course;

    @OneToOne(() => SectionContent, (content) => content.section, {
        cascade: true,
        eager: true,
    })
    content: SectionContent;

    @OneToOne(() => Section, (section) => section.next)
    next: Section;

    @OneToOne(() => Section, (section) => section.previous)
    previous: Section;

    constructor(level: Partial<Section>) {
        super();
        Object.assign(this, level);
    }
}