import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1740457619284 implements MigrationInterface {
    name = 'PostRefactoring1740457619284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_product" DROP CONSTRAINT "FK_95a99854afa53616ffa400d8087"`);
        await queryRunner.query(`ALTER TABLE "order_product" RENAME COLUMN "orderOrderId" TO "order_id"`);
        await queryRunner.query(`ALTER TABLE "order_product" ADD CONSTRAINT "FK_ea143999ecfa6a152f2202895e2" FOREIGN KEY ("order_id") REFERENCES "order"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_product" DROP CONSTRAINT "FK_ea143999ecfa6a152f2202895e2"`);
        await queryRunner.query(`ALTER TABLE "order_product" RENAME COLUMN "order_id" TO "orderOrderId"`);
        await queryRunner.query(`ALTER TABLE "order_product" ADD CONSTRAINT "FK_95a99854afa53616ffa400d8087" FOREIGN KEY ("orderOrderId") REFERENCES "order"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
