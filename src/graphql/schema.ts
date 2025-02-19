import { buildSchema } from "graphql";

export const schema = buildSchema(`#graphql
    type User{
        user_id: ID!
        first_name: String!
        last_name: String!
        email: String!
        address: String!
    }

    type Product{
        product_id: ID!
        product_name: String!
        description: String!
        price: Int!
    }

    type Order {
        order_id: ID!
        user: User!
        product_ordered: Product!
        total_paid: Int!
    }

    type Query{
        getUsers: [User]
        getUserById(user_id: ID!): User
        getProducts: [Product]
        getProductById(product_id: ID!): Product
        getOrders: [Order]
        getOrdersByUser(user_id: ID!): [Order]
        getOrdersByProduct(product_id: ID!): [Order]
    }

    type Mutation{
        createUser(first_name: String!, last_name: String!, address: String!, email: String!) :User
        createProduct(product_name: String!, description: String!, price: Int!): Product
        createOrder(user_id: ID!, product_id: ID!, total_paid: Int!): Order
        createOrderByProductName(user_id: ID!, product_name: String!, total_paid: Int!) : Order
    }
    `);