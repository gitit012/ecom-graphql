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

    type OrderItem{
        product: Product!
        quantity: Int!
    }

    type Order {
        order_id: ID!
        user: User!
        items: [OrderItem!]!
        total_paid: Int!
    }

    input OrderItemInput {
        product_id: ID!
        quantity: Int!
    }

    type Query{
        getUsers: [User]
        getUserById(user_id: ID!): User
        getProducts: [Product]
        getProductById(product_id: ID!): Product
        getOrders: [Order]
        getOrdersByUser(user_id: ID!): [Order]
        getOrdersByProduct(product_id: ID!): [Order]
        getTotalBillByUser(user_id:ID!): Float
    }

    type Mutation{
        createUser(first_name: String!, last_name: String!, address: String!, email: String!) :User
        createProduct(product_name: String!, description: String!, price: Int!): Product
        createOrder(user_id: ID!, items: [OrderItemInput!]!): Order
        createOrderByProductName(user_id: ID!, product_name: String!, quantity: Int!) : Order
        DeleteUser(user_id: ID!) : String
    }
    `);