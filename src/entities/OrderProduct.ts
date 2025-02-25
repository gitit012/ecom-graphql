import { Entity,PrimaryGeneratedColumn,ManyToOne,Column,JoinColumn } from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";

@Entity()
export class OrderProduct {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Order, order => order.items, { onDelete: "CASCADE" }) 
    @JoinColumn({ name: "order_id" }) 
    order: Order; 

    @ManyToOne(() => Product)
    product: Product;

    @Column()
    quantity: number;
}
