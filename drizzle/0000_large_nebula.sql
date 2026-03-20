CREATE TYPE "public"."debt_priority" AS ENUM('alta', 'media', 'baixa');--> statement-breakpoint
CREATE TYPE "public"."debt_status" AS ENUM('ativa', 'quitada', 'renegociada');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('ativo', 'inativo');--> statement-breakpoint
CREATE TYPE "public"."fund_type" AS ENUM('empresa', 'pessoal');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pago', 'pendente', 'atrasado');--> statement-breakpoint
CREATE TYPE "public"."revenue_status" AS ENUM('pendente', 'recebido', 'atrasado');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "company_fixed_costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"description" varchar(500) NOT NULL,
	"category" varchar(100) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"dueDay" integer NOT NULL,
	"dueDate" varchar(10),
	"status" "payment_status" DEFAULT 'pendente' NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_variable_costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"description" varchar(500) NOT NULL,
	"category" varchar(100) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" varchar(10) NOT NULL,
	"supplier" varchar(255),
	"status" "payment_status" DEFAULT 'pendente' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"creditor" varchar(255) NOT NULL,
	"description" varchar(500) NOT NULL,
	"originalAmount" numeric(12, 2) NOT NULL,
	"currentBalance" numeric(12, 2) NOT NULL,
	"monthlyPayment" numeric(12, 2) NOT NULL,
	"interestRate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"totalInstallments" integer NOT NULL,
	"paidInstallments" integer DEFAULT 0 NOT NULL,
	"dueDay" integer NOT NULL,
	"debtStatus" "debt_status" DEFAULT 'ativa' NOT NULL,
	"priority" "debt_priority" DEFAULT 'media' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"empRole" varchar(255) NOT NULL,
	"salary" numeric(12, 2) NOT NULL,
	"fgtsAmount" numeric(12, 2) NOT NULL,
	"thirteenthProvision" numeric(12, 2) NOT NULL,
	"vacationProvision" numeric(12, 2) NOT NULL,
	"totalCost" numeric(12, 2) NOT NULL,
	"admissionDate" varchar(10),
	"empStatus" "employee_status" DEFAULT 'ativo' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"description" varchar(500) NOT NULL,
	"institution" varchar(255) NOT NULL,
	"investType" varchar(100) NOT NULL,
	"depositAmount" numeric(12, 2) NOT NULL,
	"currentBalance" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"yieldAmount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"date" varchar(10) NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_fixed_costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"description" varchar(500) NOT NULL,
	"category" varchar(100) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"dueDay" integer NOT NULL,
	"dueDate" varchar(10),
	"status" "payment_status" DEFAULT 'pendente' NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_variable_costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"description" varchar(500) NOT NULL,
	"category" varchar(100) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" varchar(10) NOT NULL,
	"status" "payment_status" DEFAULT 'pendente' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reserve_funds" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"fundType" "fund_type" NOT NULL,
	"depositAmount" numeric(12, 2) NOT NULL,
	"date" varchar(10) NOT NULL,
	"description" varchar(500),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenues" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"description" varchar(500) NOT NULL,
	"category" varchar(100) NOT NULL,
	"grossAmount" numeric(12, 2) NOT NULL,
	"taxAmount" numeric(12, 2) NOT NULL,
	"netAmount" numeric(12, 2) NOT NULL,
	"client" varchar(255),
	"dueDate" varchar(10) NOT NULL,
	"receivedDate" varchar(10),
	"status" "revenue_status" DEFAULT 'pendente' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"taxPercent" numeric(5, 2) DEFAULT '6.00' NOT NULL,
	"tithePercent" numeric(5, 2) DEFAULT '10.00' NOT NULL,
	"investmentPercent" numeric(5, 2) DEFAULT '10.00' NOT NULL,
	"proLaboreGross" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"companyReserveMonths" integer DEFAULT 3 NOT NULL,
	"personalReserveMonths" integer DEFAULT 6 NOT NULL,
	"companyName" varchar(255) DEFAULT 'Minha Empresa',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"supplierId" integer NOT NULL,
	"description" varchar(500) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"dueDate" varchar(10) NOT NULL,
	"paidDate" varchar(10),
	"status" "payment_status" DEFAULT 'pendente' NOT NULL,
	"paymentMethod" varchar(100),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"cnpj" varchar(20),
	"category" varchar(100),
	"contact" varchar(255),
	"phone" varchar(20),
	"email" varchar(320),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
