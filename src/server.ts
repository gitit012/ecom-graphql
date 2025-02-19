import express from "express";
import { ApolloServer } from "apollo-server-express";
import { AppDataSource } from "./data-source";
import { schema } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";

import { Any } from "typeorm";

async function startServer() {
    const app = express();
    
    const server = new ApolloServer({
        typeDefs:schema,
        resolvers
    });

    await server.start();
    server.applyMiddleware({ app: app as any, path: "/graphql" });

    AppDataSource.initialize()
    .then(()=>{
        app.listen(4000,()=>
        console.log("server running on localhost:4000/graphql..."))
    }).catch((error)=>console.log(error));
}

startServer();