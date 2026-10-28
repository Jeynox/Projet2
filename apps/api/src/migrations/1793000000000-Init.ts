import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1793000000000 implements MigrationInterface {
	name = 'Init1793000000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "admin_user" ("id" SERIAL NOT NULL, "email" character varying(200) NOT NULL, "passwordHash" character varying(200) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_admin_user_email" UNIQUE ("email"), CONSTRAINT "PK_admin_user" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TYPE "public"."product_category" AS ENUM('fleur', 'bouquet', 'vase', 'coffret', 'herbe')`
		);
		await queryRunner.query(
			`CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(120) NOT NULL, "category" "public"."product_category" NOT NULL, "priceCents" integer NOT NULL, "stock" integer NOT NULL DEFAULT '0', "description" text NOT NULL DEFAULT '', "imageUrl" character varying(500), "featured" boolean NOT NULL DEFAULT false, "published" boolean NOT NULL DEFAULT true, "position" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_product_slug" UNIQUE ("slug"), CONSTRAINT "CHK_product_price" CHECK ("priceCents" >= 0), CONSTRAINT "CHK_product_stock" CHECK ("stock" >= 0), CONSTRAINT "PK_product" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TYPE "public"."order_status" AS ENUM('new', 'in_progress', 'ready', 'done', 'cancelled')`
		);
		await queryRunner.query(
			`CREATE TABLE "custom_order" ("id" SERIAL NOT NULL, "shape" character varying(20) NOT NULL, "color" character varying(20) NOT NULL, "mainFlower" character varying(20) NOT NULL, "secondaryFlower" character varying(20) NOT NULL, "greenery" character varying(20) NOT NULL, "customerName" character varying(120) NOT NULL, "email" character varying(200) NOT NULL, "phone" character varying(30) NOT NULL DEFAULT '', "note" text NOT NULL DEFAULT '', "status" "public"."order_status" NOT NULL DEFAULT 'new', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_custom_order" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "contact_message" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, "email" character varying(200) NOT NULL, "body" text NOT NULL, "read" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_contact_message" PRIMARY KEY ("id"))`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "contact_message"`);
		await queryRunner.query(`DROP TABLE "custom_order"`);
		await queryRunner.query(`DROP TYPE "public"."order_status"`);
		await queryRunner.query(`DROP TABLE "product"`);
		await queryRunner.query(`DROP TYPE "public"."product_category"`);
		await queryRunner.query(`DROP TABLE "admin_user"`);
	}
}
