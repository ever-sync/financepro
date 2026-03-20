CREATE TYPE "public"."contract_type" AS ENUM('clt', 'pj');--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "contractType" "contract_type" DEFAULT 'clt' NOT NULL;