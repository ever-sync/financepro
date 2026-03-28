ALTER TABLE "settings"
ADD COLUMN "companyMinCashMonths" numeric(6, 2) DEFAULT '1.00' NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings"
ADD COLUMN "personalMinCashMonths" numeric(6, 2) DEFAULT '1.00' NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_advisor_snapshots" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "integrationId" integer,
  "relatedPlanId" integer,
  "snapshotType" varchar(40) NOT NULL,
  "referenceDate" varchar(10) NOT NULL,
  "periodMonth" integer NOT NULL,
  "periodYear" integer NOT NULL,
  "status" varchar(40) DEFAULT 'generated' NOT NULL,
  "cashRiskLevel" varchar(20) NOT NULL,
  "summary" text NOT NULL,
  "confidenceScore" numeric(4, 2) DEFAULT '1.00' NOT NULL,
  "snapshotPayload" text NOT NULL,
  "recommendationsPayload" text,
  "confirmedAt" timestamp,
  "executedAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
