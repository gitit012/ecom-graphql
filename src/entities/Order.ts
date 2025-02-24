import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import {User} from "./User"
import {Product} from "./Product"
import { OrderProduct } from "./OrderProduct";

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

    @OneToMany(()=> OrderProduct, item=>item.order, {cascade: true}) 
    items: OrderProduct[];

    @Column("int")
    total_paid!: number;
}
