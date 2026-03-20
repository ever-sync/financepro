ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "recurrence" varchar(20) DEFAULT 'unico' NOT NULL;
