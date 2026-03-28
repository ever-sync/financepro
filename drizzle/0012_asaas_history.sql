CREATE TABLE IF NOT EXISTS "asaas_transfers" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "accountId" integer NOT NULL,
  "asaasTransferId" varchar(64) NOT NULL,
  "status" varchar(60) DEFAULT 'PENDING' NOT NULL,
  "transferType" varchar(60),
  "operationType" varchar(60),
  "value" numeric(12, 2) NOT NULL,
  "netValue" numeric(12, 2),
  "transferDate" varchar(10),
  "scheduledDate" varchar(10),
  "effectiveDate" varchar(10),
  "bankName" varchar(255),
  "recipientName" varchar(255),
  "externalReference" varchar(120),
  "lastSyncedAt" timestamp,
  "cancelledAt" timestamp,
  "rawPayload" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "asaas_financial_transactions" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "accountId" integer NOT NULL,
  "asaasTransactionId" varchar(120) NOT NULL,
  "transactionType" varchar(60),
  "entryType" varchar(60),
  "status" varchar(60),
  "description" text,
  "value" numeric(12, 2) NOT NULL,
  "balance" numeric(12, 2),
  "transactionDate" varchar(10),
  "effectiveDate" varchar(10),
  "asaasChargeId" varchar(64),
  "asaasTransferId" varchar(64),
  "asaasInvoiceId" varchar(64),
  "lastSyncedAt" timestamp,
  "rawPayload" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "asaas_transfers_external_idx" ON "asaas_transfers" ("accountId", "asaasTransferId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "asaas_financial_transactions_external_idx" ON "asaas_financial_transactions" ("accountId", "asaasTransactionId");--> statement-breakpoint
