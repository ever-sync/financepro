CREATE TABLE "clients" (
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
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"basePrice" numeric(12, 2) NOT NULL,
	"unit" varchar(50) DEFAULT 'projeto' NOT NULL,
	"status" varchar(20) DEFAULT 'ativo' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
