import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1740055165990 implements MigrationInterface {
    name = 'PostRefactoring1740055165990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_539ede39e518562dfdadfddb492"`);
        await queryRunner.query(`CREATE TABLE "order_products_ordered_product" ("orderOrderId" uuid NOT NULL, "productProductId" uuid NOT NULL, CONSTRAINT "PK_7d1d0bd0d03fcf7e8b1942d079e" PRIMARY KEY ("orderOrderId", "productProductId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_021ea91d1a04aaa72905215f78" ON "order_products_ordered_product" ("orderOrderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_72a711c9318d366a2eb86cef86" ON "order_products_ordered_product" ("productProductId") `);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "product_id"`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_products_ordered_product" ADD CONSTRAINT "FK_021ea91d1a04aaa72905215f783" FOREIGN KEY ("orderOrderId") REFERENCES "order"("order_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "order_products_ordered_product" ADD CONSTRAINT "FK_72a711c9318d366a2eb86cef86e" FOREIGN KEY ("productProductId") REFERENCES "product"("product_id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_products_ordered_product" DROP CONSTRAINT "FK_72a711c9318d366a2eb86cef86e"`);
        await queryRunner.query(`ALTER TABLE "order_products_ordered_product" DROP CONSTRAINT "FK_021ea91d1a04aaa72905215f783"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "product_id" uuid`);
        await queryRunner.query(`DROP INDEX "public"."IDX_72a711c9318d366a2eb86cef86"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_021ea91d1a04aaa72905215f78"`);
        await queryRunner.query(`DROP TABLE "order_products_ordered_product"`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_539ede39e518562dfdadfddb492" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
