ALTER TYPE "public"."debt_status" ADD VALUE IF NOT EXISTS 'atrasada' BEFORE 'quitada';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"document" varchar(20),
	"category" varchar(100),
	"contact" varchar(255),
	"phone" varchar(20),
	"email" varchar(320),
	"address" varchar(500),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"basePrice" numeric(12, 2) NOT NULL,
	"unit" varchar(50) DEFAULT 'projeto' NOT NULL,
	"recurrence" varchar(20) DEFAULT 'unico' NOT NULL,
	"status" varchar(20) DEFAULT 'ativo' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "recurrence" varchar(20) DEFAULT 'unico' NOT NULL;--> statement-breakpoint
ALTER TABLE "company_variable_costs" ADD COLUMN IF NOT EXISTS "installmentSeriesId" varchar(64);--> statement-breakpoint
ALTER TABLE "company_variable_costs" ADD COLUMN IF NOT EXISTS "installmentCount" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "company_variable_costs" ADD COLUMN IF NOT EXISTS "installmentNumber" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "paymentDay" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_variable_costs" ADD COLUMN IF NOT EXISTS "installmentSeriesId" varchar(64);--> statement-breakpoint
ALTER TABLE "personal_variable_costs" ADD COLUMN IF NOT EXISTS "installmentCount" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_variable_costs" ADD COLUMN IF NOT EXISTS "installmentNumber" integer DEFAULT 1 NOT NULL;
