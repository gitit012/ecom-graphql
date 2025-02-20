import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import {User} from "./User"
import {Product} from "./Product"

@Entity()
export class Order{
    @PrimaryGeneratedColumn("uuid")
    order_id!: string;

    @ManyToOne(() => User, (user)=>user.orders,{onDelete: "CASCADE"})
    @JoinColumn({ name: "user_id" })
    user!: User;
    
    @ManyToMany(() => Product)
    @JoinTable()
    products_ordered!: Product[];

    @Column("int")
    total_paid!: number;
}
