import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Product{
    @PrimaryGeneratedColumn("uuid")
    product_id!: string;

    @Column()
    product_name!: string

    @Column()
    description!: string

    @Column("int")
    price!: number;


}