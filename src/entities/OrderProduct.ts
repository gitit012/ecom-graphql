import { Entity,PrimaryGeneratedColumn,ManyToOne,Column } from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";

@Entity()
export class OrderProduct{
    @PrimaryGeneratedColumn("uuid")
    id : string

    @ManyToOne(()=> Order, order => order.items)
    order: Order;

    @ManyToOne(() => Product)
    product : Product;

    @Column()
    quantity: number;

}