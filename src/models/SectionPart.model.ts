import { Column, Entity, OneToMany } from "typeorm";
import BaseModel from "./Base.model";
import { SectionContent } from "./SectionContent.model";

@Entity("section_parts")
export class SectionPart extends BaseModel {

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    title: string;

    @Column({ type: "text", nullable: false, unique: false })
    content: string;

    @OneToMany(() => SectionContent, (sectionContent) => sectionContent.parts)
    sectionContent: SectionContent;

    constructor(sectionPart: Partial<SectionPart>) {
        super();
        Object.assign(this, sectionPart);
    }
}