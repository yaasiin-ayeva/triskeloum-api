import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export default abstract class BaseModel extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @CreateDateColumn()
    public created_at?: Date;

    @UpdateDateColumn()
    public updated_at?: Date;

}