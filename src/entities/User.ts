import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { Order } from "./Order";

@Entity()
export class User{
    @PrimaryGeneratedColumn("uuid")
    user_id!: string;

    @Column()
    first_name!: string

    @Column()
    last_name!: string

    @Column()
    address!: string

    @Column({unique: true})
    email!: string

    @OneToMany(()=> Order, (order)=>order.user)
    orders: Order[]
}