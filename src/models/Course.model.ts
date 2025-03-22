import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import BaseModel from "./Base.model";
import { Level } from "./Level.model";
import { Category } from "./Category.model";
import { Section } from "./Section.model";

@Entity("courses")
export class Course extends BaseModel {

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    title: string;

    @ManyToOne(() => Level, (level) => level.courses, { eager: true })
    level: Level;

    @ManyToOne(() => Category, (category) => category.courses, { eager: true })
    category: Category;

    @Column({ type: "boolean", nullable: false, default: false })
    published: boolean;

    @Column({ type: "varchar", nullable: true, unique: false })
    cover: string;

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    legend: string;

    @Column({ type: "int", nullable: false, unique: false })
    est_time_min: number;

    @OneToMany(() => Section, (section) => section.course, {
        cascade: true,
        eager: true,
    })
    sections: Section[];

    constructor(course: Partial<Course>) {
        super();
        Object.assign(this, course);
    }
}