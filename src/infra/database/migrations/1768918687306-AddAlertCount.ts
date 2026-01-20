import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAlertCount1768918687306 implements MigrationInterface {
    name = 'AddAlertCount1768918687306'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_checkin_status" ADD "total_alerts_sent" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_checkin_status" ADD "emergency_threshold_days" integer NOT NULL DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emergencyContacts" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emergencyContacts"`);
        await queryRunner.query(`ALTER TABLE "user_checkin_status" DROP COLUMN "emergency_threshold_days"`);
        await queryRunner.query(`ALTER TABLE "user_checkin_status" DROP COLUMN "total_alerts_sent"`);
    }

}
