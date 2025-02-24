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
            return await AppDataSource.getRepository(Order).find({
                relations: ["user","items", "items.product"]})
        },
        getOrdersByUser: async(_:any, args: {user_id:string})=>{
            return await AppDataSource.getRepository(Order).find({
                where: {user: {user_id:args.user_id}},
                relations: ["user","items", "items.product"]
            })
        },
        getOrdersByProduct: async(_:any, args:{product_id:string})=>{
            return await AppDataSource.getRepository(Order)
                .createQueryBuilder("order")
                .innerJoinAndSelect("order.items", "item")
                .innerJoinAndSelect("item.product", "product")
                .where("product.product_id = :productId", {productId: args.product_id})
                .getMany();    
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
        }) =>{
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try{
                const user = await queryRunner.manager.findOne(User,{where: {user_id:args.user_id}})
                if (!user) throw new Error("User not found");

                const orderProducts = await Promise.all(
                    args.items.map(async (item) =>{
                        const product = await queryRunner.manager.findOne(Product,{where: {product_id: item.product_id}});
                        if (!product) throw new Error(`Product ${item.product_id} not found`);

                        const orderProduct = new OrderProduct();
                        orderProduct.product = product;
                        orderProduct.quantity = item.quantity;
                        return orderProduct;
                    })
                );

                //calc total
                const total = orderProducts.reduce(
                    (sum,item) => sum +(item.product.price* item.quantity),0);

                const order = new Order();
                order.user = user
                order.items = orderProducts;
                order.total_paid = total;

                const savedOrder = await queryRunner.manager.save(order)

                await queryRunner.commitTransaction();
                return savedOrder;
            } catch(error){
                await queryRunner.rollbackTransaction();
                throw new Error (`Faile to create order :${error.message}`);
            } finally{
                await queryRunner.release();
            }
        },

        createOrderByProductName: async(_:any,args:{
            user_id: string;
            product_name: string;
            quantity:number;
        }) =>{
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try{
                const user = await queryRunner.manager.findOne(User,{where: {user_id:args.user_id}})
                if (!user) throw new Error("User not found");

                const product = await queryRunner.manager.findOne(Product, {
                    where: { product_name: args.product_name }
                });
                if (!product) throw new Error("Product not found");
                
                const orderProduct = new OrderProduct();
                orderProduct.product = product;
                orderProduct.quantity = args.quantity;
            
                // Calculate total
                const total = product.price * args.quantity;

                const order = new Order();
                order.user = user;
                order.items = [orderProduct];
                order.total_paid = total;

                const saveOrder = await queryRunner.manager.save(order);
                await queryRunner.commitTransaction();
                return saveOrder;
            } catch (error) {
                throw new Error(`Failed to create order: ${error.message}`);
            } finally{
                await queryRunner.release();
            }
        },
        DeleteUser: async (_: any, args: any) => {
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                const user = await queryRunner.manager.findOne(User, {where: { user_id: args.user_id }});
                if (!user) throw new Error("User not found");

                await queryRunner.manager.delete(Order, { user: { user_id: args.user_id } });
                await queryRunner.manager.delete(User, { user_id: args.user_id });
                await queryRunner.commitTransaction();
                return "User and orders deleted";
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw new Error(`Failed to delete: ${error.message}`);
            } finally {
                await queryRunner.release();
            }
        }
    },
        Order: {
            items: async (parent: Order) => {
                // If items are not loaded, fetch them
                if (!parent.items) {
                    const order = await AppDataSource.getRepository(Order).findOne({
                        where: { order_id: parent.order_id },
                        relations: ["items", "items.product"]
                    });
                    return order?.items || [];
                }
                return parent.items;
            }
        },
    
        OrderItem: {
            product: async (parent: OrderProduct) => {
                // If product is not loaded, fetch it
                if (!parent.product) {
                    return await AppDataSource.getRepository(Product).findOneBy({
                        product_id: parent.product.product_id
                    });
                }
                return parent.product;
            }
        }
};