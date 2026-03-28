CREATE TYPE "public"."whatsapp_provider" AS ENUM('uazapi');--> statement-breakpoint
CREATE TYPE "public"."whatsapp_direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."whatsapp_message_status" AS ENUM('received', 'processed', 'sent', 'delivered', 'failed', 'ignored');--> statement-breakpoint
CREATE TYPE "public"."assistant_run_status" AS ENUM('recebido', 'analisado', 'aguardando_confirmacao', 'executado', 'falhou', 'descartado');--> statement-breakpoint
CREATE TYPE "public"."assistant_run_trigger" AS ENUM('direct_message', 'daily_digest', 'month_start', 'month_end', 'alert', 'confirmation');--> statement-breakpoint
CREATE TYPE "public"."financial_plan_status" AS ENUM('rascunho', 'ativo', 'fechado', 'descartado');--> statement-breakpoint
CREATE TYPE "public"."financial_plan_action_status" AS ENUM('pendente', 'concluida', 'adiada', 'descartada');--> statement-breakpoint
CREATE TYPE "public"."notification_event_status" AS ENUM('agendado', 'enviado', 'falhou', 'adiado', 'descartado');--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "whatsapp_integrations" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "provider" "whatsapp_provider" DEFAULT 'uazapi' NOT NULL,
  "instanceId" varchar(120) NOT NULL,
  "apiBaseUrl" varchar(255) NOT NULL,
  "apiToken" text NOT NULL,
  "authorizedPhone" varchar(32) NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "automationHour" integer DEFAULT 8 NOT NULL,
  "timezone" varchar(80) DEFAULT 'America/Sao_Paulo' NOT NULL,
  "webhookUrl" varchar(500),
  "lastConnectionStatus" varchar(40) DEFAULT 'pendente' NOT NULL,
  "lastConnectionMessage" text,
  "lastConnectionCheckedAt" timestamp,
  "lastWebhookReceivedAt" timestamp,
  "lastMessageReceivedAt" timestamp,
  "lastMessageSentAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "whatsapp_contacts" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "integrationId" integer NOT NULL,
  "phoneNumber" varchar(32) NOT NULL,
  "displayName" varchar(255),
  "isAuthorized" boolean DEFAULT false NOT NULL,
  "lastSeenAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "assistant_threads" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "integrationId" integer NOT NULL,
  "contactId" integer NOT NULL,
  "channel" varchar(40) DEFAULT 'whatsapp' NOT NULL,
  "status" varchar(40) DEFAULT 'active' NOT NULL,
  "lastMessageAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "whatsapp_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "integrationId" integer NOT NULL,
  "contactId" integer NOT NULL,
  "threadId" integer NOT NULL,
  "providerMessageId" varchar(255),
  "direction" "whatsapp_direction" NOT NULL,
  "status" "whatsapp_message_status" DEFAULT 'received' NOT NULL,
  "textContent" text NOT NULL,
  "detectedIntent" varchar(80),
  "requiresConfirmation" boolean DEFAULT false NOT NULL,
  "rawPayload" text,
  "deliveredAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "assistant_runs" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "integrationId" integer NOT NULL,
  "threadId" integer NOT NULL,
  "triggerType" "assistant_run_trigger" NOT NULL,
  "status" "assistant_run_status" DEFAULT 'recebido' NOT NULL,
  "userMessage" text,
  "normalizedIntent" varchar(80),
  "contextPayload" text,
  "assistantResponse" text,
  "suggestedActions" text,
  "executedActions" text,
  "requiresConfirmation" boolean DEFAULT false NOT NULL,
  "confirmedAt" timestamp,
  "expiresAt" timestamp,
  "errorMessage" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "financial_plans" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "threadId" integer,
  "periodMonth" integer NOT NULL,
  "periodYear" integer NOT NULL,
  "status" "financial_plan_status" DEFAULT 'rascunho' NOT NULL,
  "summary" text NOT NULL,
  "targetBalance" numeric(12, 2),
  "recommendedCashAction" text,
  "rawAnalysis" text,
  "generatedAt" timestamp DEFAULT now() NOT NULL,
  "confirmedAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "financial_plan_actions" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "planId" integer NOT NULL,
  "actionType" varchar(80) NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "priority" varchar(20) DEFAULT 'medium' NOT NULL,
  "status" "financial_plan_action_status" DEFAULT 'pendente' NOT NULL,
  "dueDate" varchar(10),
  "snoozedUntil" timestamp,
  "metadata" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "notification_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "integrationId" integer NOT NULL,
  "relatedRunId" integer,
  "relatedPlanId" integer,
  "relatedMessageId" integer,
  "type" varchar(80) NOT NULL,
  "scope" varchar(80) NOT NULL,
  "title" varchar(255) NOT NULL,
  "messageBody" text NOT NULL,
  "dedupeKey" varchar(160) NOT NULL,
  "status" "notification_event_status" DEFAULT 'agendado' NOT NULL,
  "scheduledFor" timestamp,
  "sentAt" timestamp,
  "snoozedUntil" timestamp,
  "lastError" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "whatsapp_integrations_user_provider_idx" ON "whatsapp_integrations" ("userId", "provider");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "whatsapp_contacts_user_phone_idx" ON "whatsapp_contacts" ("userId", "phoneNumber");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_events_dedupe_idx" ON "notification_events" ("integrationId", "dedupeKey");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "financial_plans_period_idx" ON "financial_plans" ("userId", "periodYear", "periodMonth");--> statement-breakpoint
