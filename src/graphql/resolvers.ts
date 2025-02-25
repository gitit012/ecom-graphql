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
        createProduct: async (_: any, args: { product_name: string; description: string; price: number }) => {
            const productRepository = AppDataSource.getRepository(Product);
        
            // check if a product with the same name already exists
            const existingProduct = await productRepository.findOneBy({ product_name: args.product_name });
            if (existingProduct) {
                throw new Error(`Product with name "${args.product_name}" already exists.`);
            }
        
            // Create new product
            const product = productRepository.create(args);
            return await productRepository.save(product);
        },        
        createOrder: async (_: any, args: {
            user_id: string;
            items: { product_id: string; quantity: number }[];
        }) => {
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
        
            try {
                const user = await queryRunner.manager.findOne(User, {
                    where: { user_id: args.user_id }
                });
                if (!user) throw new Error("User not found");
        
                let order = await queryRunner.manager.findOne(Order, {
                    where: { user: { user_id: args.user_id } },
                    relations: ["items", "items.product", "user"] // Ensure user is loaded
                });
        
                if (!order) {
                    order = new Order();
                    order.user = user; // Explicitly set user
                    order.items = [];
                }
        
                for (const item of args.items) {
                    let existingOrderProduct = order.items.find(op => op.product.product_id === item.product_id);
        
                    if (existingOrderProduct) {
                        existingOrderProduct.quantity += item.quantity;
                    } else {
                        const product = await queryRunner.manager.findOne(Product, {
                            where: { product_id: item.product_id }
                        });
                        if (!product) throw new Error(`Product ${item.product_id} not found`);
        
                        const newOrderProduct = new OrderProduct();
                        newOrderProduct.product = product;
                        newOrderProduct.quantity = item.quantity;
                        newOrderProduct.order = order;
        
                        order.items.push(newOrderProduct);
                    }
                }
        
                order.total_paid = order.items.reduce(
                    (sum, item) => sum + item.product.price * item.quantity,
                    0
                );
        
                // Save order and updated order items
                await queryRunner.manager.save(order);
        
                // **Force load the user again before returning to avoid null issue**
                const savedOrder = await queryRunner.manager.findOne(Order, {
                    where: { order_id: order.order_id },
                    relations: ["user", "items", "items.product"]
                });
        
                await queryRunner.commitTransaction();
                return savedOrder;
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw new Error(`Failed to create/update order: ${error.message}`);
            } finally {
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
        
                // Step 1: Find orders related to the user
                const orders = await queryRunner.manager.find(Order, { where: { user: { user_id: args.user_id } } });
        
                if (orders.length > 0) {
                    // Step 2: Delete all order_product entries related to the user's orders
                    await queryRunner.manager
                    .createQueryBuilder()
                    .delete()
                    .from(OrderProduct)
                    .where("order_id IN (SELECT order_id FROM \"order\" WHERE user_id = :userId)", { userId: args.user_id })
                    .execute();
                
        
                    // Step 3: Delete the orders
                    await queryRunner.manager.delete(Order, { user: { user_id: args.user_id } });
                }
        
                // Step 4: Delete the user
                await queryRunner.manager.delete(User, { user_id: args.user_id });
        
                await queryRunner.commitTransaction();
                return "User and related orders deleted";
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw new Error(`Failed to delete: ${error.message}`);
            } finally {
                await queryRunner.release();
            }
        }
    }        
};