import { AppDataSource } from "./data-source"
import 'reflect-metadata'

AppDataSource.initialize().then(async () => {

    await AppDataSource.runMigrations();
    })
