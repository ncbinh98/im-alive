import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCheckInModule1767435363642 implements MigrationInterface {
    name = 'CreateCheckInModule1767435363642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "check_ins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "checked_in_at" TIMESTAMP NOT NULL DEFAULT now(), "notes" character varying(500), CONSTRAINT "PK_fac7f27bc829a454ad477c13f62" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_checkin_status" ("user_id" uuid NOT NULL, "latest_check_in" TIMESTAMP, "alert_after_days" integer NOT NULL DEFAULT '7', "expired_latest_check_in" TIMESTAMP, "next_alert_check" TIMESTAMP, "alerts_enabled" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_637d7f4ac28ee1a12f6897ef9c1" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_df9083c7e3dd84f4df8d5a6b15" ON "user_checkin_status" ("next_alert_check") `);
        await queryRunner.query(`ALTER TABLE "check_ins" ADD CONSTRAINT "FK_7b8c2fc47cf37006c80fc5e80a9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_checkin_status" ADD CONSTRAINT "FK_637d7f4ac28ee1a12f6897ef9c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_checkin_status" DROP CONSTRAINT "FK_637d7f4ac28ee1a12f6897ef9c1"`);
        await queryRunner.query(`ALTER TABLE "check_ins" DROP CONSTRAINT "FK_7b8c2fc47cf37006c80fc5e80a9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df9083c7e3dd84f4df8d5a6b15"`);
        await queryRunner.query(`DROP TABLE "user_checkin_status"`);
        await queryRunner.query(`DROP TABLE "check_ins"`);
    }

}
