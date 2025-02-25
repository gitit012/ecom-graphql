import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1740457471569 implements MigrationInterface {
    name = 'PostRefactoring1740457471569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_product" DROP CONSTRAINT "FK_95a99854afa53616ffa400d8087"`);
        await queryRunner.query(`ALTER TABLE "order_product" ADD CONSTRAINT "FK_95a99854afa53616ffa400d8087" FOREIGN KEY ("orderOrderId") REFERENCES "order"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_product" DROP CONSTRAINT "FK_95a99854afa53616ffa400d8087"`);
        await queryRunner.query(`ALTER TABLE "order_product" ADD CONSTRAINT "FK_95a99854afa53616ffa400d8087" FOREIGN KEY ("orderOrderId") REFERENCES "order"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
