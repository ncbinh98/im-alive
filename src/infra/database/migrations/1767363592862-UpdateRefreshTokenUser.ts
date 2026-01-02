import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRefreshTokenUser1767363592862 implements MigrationInterface {
    name = 'UpdateRefreshTokenUser1767363592862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }

}
