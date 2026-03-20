ALTER TABLE "company_variable_costs" ADD COLUMN IF NOT EXISTS "installmentSeriesId" varchar(64);
ALTER TABLE "company_variable_costs" ADD COLUMN IF NOT EXISTS "installmentCount" integer DEFAULT 1 NOT NULL;
ALTER TABLE "company_variable_costs" ADD COLUMN IF NOT EXISTS "installmentNumber" integer DEFAULT 1 NOT NULL;

ALTER TABLE "personal_variable_costs" ADD COLUMN IF NOT EXISTS "installmentSeriesId" varchar(64);
ALTER TABLE "personal_variable_costs" ADD COLUMN IF NOT EXISTS "installmentCount" integer DEFAULT 1 NOT NULL;
ALTER TABLE "personal_variable_costs" ADD COLUMN IF NOT EXISTS "installmentNumber" integer DEFAULT 1 NOT NULL;
