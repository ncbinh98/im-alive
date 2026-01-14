import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTelegramId1768390307792 implements MigrationInterface {
    name = 'AddTelegramId1768390307792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "telegramId" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_df18d17f84763558ac84192c754" UNIQUE ("telegramId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_df18d17f84763558ac84192c754"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "telegramId"`);
    }

}
