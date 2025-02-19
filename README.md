# Awesome Project Build with TypeORM

Steps to run this project:

0. Do `npm install`

1. Add your postgres credentials into the `data-source` file.

2. Next we have to do `npm run generate` to create migration files. Here `generate` is already defined in package.json. 

*NOTE: I AM INCLUDING MY MIGRATION FILES INSIDE THE GIT-FOLDER*

3. Move the above created migration files into the correct migration folder inside `src`

4. Now do `npm start` to create the tables inside postgres

5. NOTE: We have not yet started the server, for that we have to do `ts-node src/server.ts` inside the terminal.