import { Column, Entity } from "typeorm";
import BaseModel from "./Base.model";

@Entity("quotes")
export class Quote extends BaseModel {

    @Column({ type: "varchar", nullable: true, unique: false })
    cover: string;

    @Column({ type: "text", nullable: false, unique: false })
    content: string;

    @Column({ type: "varchar", default: null })
    author: string;

    constructor(quote: Partial<Quote>) {
        super();
        Object.assign(this, quote);
    }
}