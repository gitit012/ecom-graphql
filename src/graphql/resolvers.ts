import {AppDataSource} from "../data-source"
import { User } from "../entities/User"
import { Product } from "../entities/Product";
import { Order } from "../entities/Order";
import { In } from "typeorm";
import { OrderProduct } from "../entities/OrderProduct";

export const resolvers = {
    Query:{
        getUsers: async()=>{
            return await AppDataSource.getRepository(User).find();
        },
        getUserById: async(_:any, args: {user_id:string}) =>{
            return await AppDataSource.getRepository(User).findOneBy({user_id:args.user_id})
        },
        getProducts : async()=>{
            return await AppDataSource.getRepository(Product).find()
        },
        getProductById: async(_:any, args: {product_id:string}) =>{
            return await AppDataSource.getRepository(Product).findOneBy({product_id:args.product_id})
        },
        getOrders: async()=>{
            return await AppDataSource.getRepository(Order).find({relations: ["user","products_ordered"]})
        },
        getOrdersByUser: async(_:any, args: {user_id:string})=>{
            return await AppDataSource.getRepository(Order).find({
                where: {user: {user_id:args.user_id}},
                relations: ["user", "products_ordered"]
            })
        },
        getOrdersByProduct: async(_:any, args:{product_id:string})=>{
            return await AppDataSource.getRepository(Order).find({
                where: {products_ordered: {product_id: args.product_id}},
                relations: ["user", "products_ordered"]
            })
        },
        getTotalBillByUser: async(_:any, args:{user_id:string})=>{
            const bill = await AppDataSource.getRepository(Order)
                .createQueryBuilder("order")
                .select("SUM(order.total_paid)", "total")
                .innerJoin("order.user", "user")
                .where("user.user_id = :user_id", {user_id:args.user_id})
                .getRawOne()
            return bill?.total || 0;
        }
    },
    Mutation:{
        createUser: async (_:any, args:any) =>{
            const user = AppDataSource.getRepository(User).create(args);
            return await AppDataSource.getRepository(User).save(user)
        },
        createProduct: async(_:any,args:any) =>{
            const product = AppDataSource.getRepository(Product).create(args);
            return await AppDataSource.getRepository(Product).save(product);
        },
        createOrder: async(_:any,args:{
            user_id: string;
            items: {product_id: string; quantity: number}[];
            total_paid: number 
        }) =>{
            try{
                const user = await AppDataSource.getRepository(User).findOneBy({user_id:args.user_id});
                if (!user) throw new Error("User not found");

                const OrderProducts = await Promise.all(
                    args.items.map(async (item) =>{
                        const product = AppDataSource.getRepository(Product).findOneBy({
                            product_id: item.product_id
                        });
                        if (!product) throw new Error(`Product ${item.product_id} not found`);

                        const OrderProduct = new OrderProduct();
                        OrderProduct.product = product;
                        OrderProduct.quantity = item.quantity;
                        return orderProduct;

                    })
                )
                
                AppDataSource.getRepository(Product).find({
                    where: {product_id: In(args.product_ids)}
                });

                if (products.length !== args.product_ids.length) {
                    throw new Error("User or Product not found");
                }
                const order = AppDataSource.getRepository(Order).create({
                    user,
                    products_ordered: products,
                    total_paid: args.total_paid
                });

                return await AppDataSource.getRepository(Order).save(order);
            } catch (error) {
                throw new Error(`Failed to create order: ${error.message}`);
            }    
        },
        createOrderByProductName: async(_:any,args:any) =>{
            try{
                const user = await AppDataSource.getRepository(User).findOneBy({user_id:args.user_id});
                if (!user) throw new Error("User not found");

                const products = await AppDataSource.getRepository(Product).find({
                    where: {product_name: In(args.product_name)}
                })
                
                if (products.length !== args.product_ids.length) {
                    throw new Error("one or more products not found");
                }
                
                const order = AppDataSource.getRepository(Order).create({
                    user,
                    products_ordered: products,
                    total_paid: args.total_paid
                })

                return await AppDataSource.getRepository(Order).save(order);
            } catch (error) {
                throw new Error(`Failed to create order: ${error.message}`);
            }
        },
        DeleteUser: async(_:any, args:any) =>{
            try{
                const userRepo = AppDataSource.getRepository(User)
                const orderRepo = AppDataSource.getRepository(Order)

                const user = await userRepo.findOne({where: {user_id:args.user_id}})
                if (!user) throw new Error("User not found");

                await orderRepo.delete({user: {user_id:args.user_id}})
                await userRepo.delete({user_id:args.user_id})
                return "user and orders deleted";
            } catch(error){
                throw new Error(`Failed to delete ${error.message}`)
            }
            
        }
}}