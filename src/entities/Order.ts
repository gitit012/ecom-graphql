import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import {User} from "./User"
import {Product} from "./Product"

@Entity()
export class Order{
    @PrimaryGeneratedColumn("uuid")
    order_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;
    
    @ManyToOne(() => Product)
    @JoinColumn({ name: "product_id" })
    product_ordered!: Product;

    @Column("int")
    total_paid!: number;
}
