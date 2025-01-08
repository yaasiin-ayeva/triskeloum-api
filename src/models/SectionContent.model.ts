import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import BaseModel from "./Base.model";
import { SectionPart } from "./SectionPart.model";
import { Section } from "./Section.model";

@Entity("section_contents")
export class SectionContent extends BaseModel {

    @Column({ type: "varchar", nullable: true, unique: true })
    cover: string;

    @Column({ type: "varchar", nullable: true, length: 255, unique: false })
    summary: string;

    @OneToOne(() => Section, (section) => section.content)
    @JoinColumn({ name: "section_id" })
    section: Section;

    @OneToMany(() => SectionPart, (sectionPart) => sectionPart.sectionContent)
    parts: SectionPart[];

    constructor(sectionContent: Partial<SectionContent>) {
        super();
        Object.assign(this, sectionContent);
    }
}