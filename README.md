# Awesome Project Build with TypeORM

*The branch `testing` is where i uploaded my latest version of the code, but it is unfinished and will not work. Below are the steps to run the main branch which works*

Steps to run this project:

0. Do `npm install`

1. Add your postgres credentials into the `src / data-source` file.

*NOTE: I AM INCLUDING MY MIGRATION FILES INSIDE THE REPO SO YOU CAN SKIP THE NEXT 3 STEPS AND DIRECTLY DO STEP 5*

2. Next we have to do `npm run generate` to create migration files. Here `generate` is already defined in package.json. 

3. Move the above created migration files into the correct migration folder inside `src`

4. Now do `npm start` to create the tables inside postgres

5. Fianlly to start the server, do `ts-node src/server.ts` inside the terminal.