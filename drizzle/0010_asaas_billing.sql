ALTER TYPE "public"."revenue_status" ADD VALUE IF NOT EXISTS 'cancelado';--> statement-breakpoint
CREATE TYPE "public"."asaas_environment" AS ENUM('sandbox', 'production');--> statement-breakpoint
CREATE TYPE "public"."asaas_sync_status" AS ENUM('pendente', 'sincronizado', 'erro');--> statement-breakpoint

ALTER TABLE "revenues"
  ADD COLUMN IF NOT EXISTS "asaasPaymentId" varchar(64),
  ADD COLUMN IF NOT EXISTS "asaasSubscriptionId" varchar(64),
  ADD COLUMN IF NOT EXISTS "asaasBillingType" varchar(30),
  ADD COLUMN IF NOT EXISTS "asaasInvoiceUrl" varchar(500),
  ADD COLUMN IF NOT EXISTS "asaasBankSlipUrl" varchar(500),
  ADD COLUMN IF NOT EXISTS "asaasLastEvent" varchar(120),
  ADD COLUMN IF NOT EXISTS "asaasExternalReference" varchar(120),
  ADD COLUMN IF NOT EXISTS "asaasSyncedAt" timestamp;--> statement-breakpoint

ALTER TABLE "clients"
  ADD COLUMN IF NOT EXISTS "asaasCustomerId" varchar(64),
  ADD COLUMN IF NOT EXISTS "asaasSyncStatus" "asaas_sync_status" DEFAULT 'pendente' NOT NULL,
  ADD COLUMN IF NOT EXISTS "asaasLastSyncError" text,
  ADD COLUMN IF NOT EXISTS "asaasLastSyncedAt" timestamp;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "asaas_accounts" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "scopeKey" varchar(100) DEFAULT 'default' NOT NULL,
  "accountName" varchar(255) DEFAULT 'Conta principal' NOT NULL,
  "environment" "asaas_environment" DEFAULT 'sandbox' NOT NULL,
  "apiKey" text NOT NULL,
  "apiBaseUrl" varchar(255),
  "webhookAuthToken" varchar(255),
  "webhookUrl" varchar(500),
  "enabled" boolean DEFAULT true NOT NULL,
  "lastConnectionStatus" varchar(40) DEFAULT 'pendente' NOT NULL,
  "lastConnectionMessage" text,
  "lastConnectionCheckedAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "asaas_charges" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "accountId" integer NOT NULL,
  "clientId" integer,
  "serviceId" integer,
  "revenueId" integer,
  "asaasChargeId" varchar(64) NOT NULL,
  "asaasCustomerId" varchar(64) NOT NULL,
  "asaasSubscriptionId" varchar(64),
  "status" varchar(60) DEFAULT 'PENDING' NOT NULL,
  "billingType" varchar(30) NOT NULL,
  "description" varchar(500) NOT NULL,
  "value" numeric(12, 2) NOT NULL,
  "dueDate" varchar(10) NOT NULL,
  "externalReference" varchar(120),
  "invoiceUrl" varchar(500),
  "bankSlipUrl" varchar(500),
  "pixQrCodeUrl" varchar(500),
  "pixCopyAndPaste" text,
  "lastEvent" varchar(120),
  "lastSyncedAt" timestamp,
  "deletedAt" timestamp,
  "rawPayload" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "asaas_subscriptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "accountId" integer NOT NULL,
  "clientId" integer,
  "serviceId" integer,
  "asaasSubscriptionId" varchar(64) NOT NULL,
  "asaasCustomerId" varchar(64) NOT NULL,
  "status" varchar(60) DEFAULT 'ACTIVE' NOT NULL,
  "billingType" varchar(30) NOT NULL,
  "cycle" varchar(30) NOT NULL,
  "description" varchar(500) NOT NULL,
  "value" numeric(12, 2) NOT NULL,
  "nextDueDate" varchar(10) NOT NULL,
  "externalReference" varchar(120),
  "deletedAt" timestamp,
  "lastSyncedAt" timestamp,
  "rawPayload" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "asaas_invoices" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "accountId" integer NOT NULL,
  "chargeId" integer,
  "revenueId" integer,
  "asaasChargeId" varchar(64),
  "asaasInvoiceId" varchar(64) NOT NULL,
  "status" varchar(60) DEFAULT 'SCHEDULED' NOT NULL,
  "value" numeric(12, 2),
  "effectiveDate" varchar(10),
  "invoiceNumber" varchar(80),
  "serviceDescription" text,
  "pdfUrl" varchar(500),
  "xmlUrl" varchar(500),
  "validationCode" varchar(120),
  "lastError" text,
  "authorizedAt" timestamp,
  "cancelledAt" timestamp,
  "lastSyncedAt" timestamp,
  "rawPayload" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "asaas_webhook_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer,
  "accountId" integer,
  "eventFingerprint" varchar(255) NOT NULL,
  "eventType" varchar(120) NOT NULL,
  "resourceType" varchar(60),
  "resourceId" varchar(64),
  "duplicate" boolean DEFAULT false NOT NULL,
  "processed" boolean DEFAULT false NOT NULL,
  "lastError" text,
  "payload" text NOT NULL,
  "processedAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "asaas_accounts_user_scope_idx" ON "asaas_accounts" ("userId", "scopeKey");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "asaas_charges_external_idx" ON "asaas_charges" ("accountId", "asaasChargeId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "asaas_subscriptions_external_idx" ON "asaas_subscriptions" ("accountId", "asaasSubscriptionId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "asaas_invoices_external_idx" ON "asaas_invoices" ("accountId", "asaasInvoiceId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "asaas_events_fingerprint_idx" ON "asaas_webhook_events" ("eventFingerprint");--> statement-breakpoint
