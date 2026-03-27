import { and, asc, desc, eq } from "drizzle-orm";
import {
  asaasAccounts,
  asaasCharges,
  asaasInvoices,
  asaasSubscriptions,
  asaasWebhookEvents,
  clients,
  revenues,
  services,
  settings,
  type InsertAsaasAccount,
  type InsertAsaasCharge,
  type InsertAsaasInvoice,
  type InsertAsaasSubscription,
  type InsertAsaasWebhookEvent,
} from "../../drizzle/schema";
import { getDb } from "../db";

export async function getAsaasAccount(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(asaasAccounts)
    .where(eq(asaasAccounts.userId, userId))
    .orderBy(desc(asaasAccounts.enabled), desc(asaasAccounts.updatedAt))
    .limit(1);
  return record;
}

export async function getAsaasAccountByWebhookToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(asaasAccounts)
    .where(and(eq(asaasAccounts.webhookAuthToken, token), eq(asaasAccounts.enabled, true)))
    .limit(1);
  return record;
}

export async function upsertAsaasAccount(
  userId: number,
  data: Partial<InsertAsaasAccount> & Pick<InsertAsaasAccount, "environment">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getAsaasAccount(userId);
  if (existing) {
    const updatePayload = {
      ...data,
      apiKey: data.apiKey || existing.apiKey,
      webhookAuthToken:
        data.webhookAuthToken === undefined ? existing.webhookAuthToken : data.webhookAuthToken,
    };
    await db.update(asaasAccounts).set(updatePayload).where(eq(asaasAccounts.id, existing.id));
    return { ...existing, ...updatePayload };
  }

  const insertPayload: InsertAsaasAccount = {
    userId,
    scopeKey: data.scopeKey ?? "default",
    accountName: data.accountName ?? "Conta principal",
    environment: data.environment,
    apiKey: data.apiKey ?? "",
    apiBaseUrl: data.apiBaseUrl ?? null,
    webhookAuthToken: data.webhookAuthToken ?? null,
    webhookUrl: data.webhookUrl ?? null,
    enabled: data.enabled ?? true,
    lastConnectionStatus: data.lastConnectionStatus ?? "pendente",
    lastConnectionMessage: data.lastConnectionMessage ?? null,
    lastConnectionCheckedAt: data.lastConnectionCheckedAt ?? null,
  };
  const [created] = await db.insert(asaasAccounts).values(insertPayload).returning();
  return created;
}

export async function markAsaasConnection(
  accountId: number,
  status: string,
  message?: string | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(asaasAccounts)
    .set({
      lastConnectionStatus: status,
      lastConnectionMessage: message ?? null,
      lastConnectionCheckedAt: new Date(),
    })
    .where(eq(asaasAccounts.id, accountId));
}

export async function getClientForSync(userId: number, clientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.userId, userId), eq(clients.id, clientId)))
    .limit(1);
  return record;
}

export async function getServiceForSync(userId: number, serviceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(services)
    .where(and(eq(services.userId, userId), eq(services.id, serviceId)))
    .limit(1);
  return record;
}

export async function listClientsForSync(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, userId)).orderBy(asc(clients.name));
}

export async function updateClientAsaasBinding(
  userId: number,
  clientId: number,
  data: {
    asaasCustomerId?: string | null;
    asaasSyncStatus?: "pendente" | "sincronizado" | "erro";
    asaasLastSyncError?: string | null;
    asaasLastSyncedAt?: Date | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(clients)
    .set(data)
    .where(and(eq(clients.userId, userId), eq(clients.id, clientId)));
}

export async function getRevenueByAsaasPaymentId(userId: number, asaasPaymentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(revenues)
    .where(and(eq(revenues.userId, userId), eq(revenues.asaasPaymentId, asaasPaymentId)))
    .limit(1);
  return record;
}

export async function getRevenueById(userId: number, revenueId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(revenues)
    .where(and(eq(revenues.userId, userId), eq(revenues.id, revenueId)))
    .limit(1);
  return record;
}

export async function getSettingsForRevenue(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
  return record;
}

export async function createRevenueForAsaasCharge(data: typeof revenues.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [record] = await db.insert(revenues).values(data).returning();
  return record;
}

export async function updateRevenueAsaasState(
  userId: number,
  revenueId: number,
  data: Partial<typeof revenues.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(revenues)
    .set(data)
    .where(and(eq(revenues.userId, userId), eq(revenues.id, revenueId)));
}

export async function listAsaasCharges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(asaasCharges)
    .where(eq(asaasCharges.userId, userId))
    .orderBy(desc(asaasCharges.createdAt));
}

export async function getAsaasChargeByExternalId(accountId: number, asaasChargeId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(asaasCharges)
    .where(and(eq(asaasCharges.accountId, accountId), eq(asaasCharges.asaasChargeId, asaasChargeId)))
    .limit(1);
  return record;
}

export async function getAsaasChargeById(userId: number, chargeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(asaasCharges)
    .where(and(eq(asaasCharges.userId, userId), eq(asaasCharges.id, chargeId)))
    .limit(1);
  return record;
}

export async function upsertAsaasCharge(data: InsertAsaasCharge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getAsaasChargeByExternalId(data.accountId, data.asaasChargeId);
  if (existing) {
    await db.update(asaasCharges).set(data).where(eq(asaasCharges.id, existing.id));
    return { ...existing, ...data };
  }
  const [created] = await db.insert(asaasCharges).values(data).returning();
  return created;
}

export async function listAsaasSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(asaasSubscriptions)
    .where(eq(asaasSubscriptions.userId, userId))
    .orderBy(desc(asaasSubscriptions.createdAt));
}

export async function getAsaasSubscriptionByExternalId(accountId: number, asaasSubscriptionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(asaasSubscriptions)
    .where(
      and(
        eq(asaasSubscriptions.accountId, accountId),
        eq(asaasSubscriptions.asaasSubscriptionId, asaasSubscriptionId)
      )
    )
    .limit(1);
  return record;
}

export async function getAsaasSubscriptionById(userId: number, subscriptionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(asaasSubscriptions)
    .where(and(eq(asaasSubscriptions.userId, userId), eq(asaasSubscriptions.id, subscriptionId)))
    .limit(1);
  return record;
}

export async function upsertAsaasSubscription(data: InsertAsaasSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getAsaasSubscriptionByExternalId(data.accountId, data.asaasSubscriptionId);
  if (existing) {
    await db.update(asaasSubscriptions).set(data).where(eq(asaasSubscriptions.id, existing.id));
    return { ...existing, ...data };
  }
  const [created] = await db.insert(asaasSubscriptions).values(data).returning();
  return created;
}

export async function listAsaasInvoices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(asaasInvoices)
    .where(eq(asaasInvoices.userId, userId))
    .orderBy(desc(asaasInvoices.createdAt));
}

export async function getAsaasInvoiceByExternalId(accountId: number, asaasInvoiceId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(asaasInvoices)
    .where(and(eq(asaasInvoices.accountId, accountId), eq(asaasInvoices.asaasInvoiceId, asaasInvoiceId)))
    .limit(1);
  return record;
}

export async function getAsaasInvoiceById(userId: number, invoiceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(asaasInvoices)
    .where(and(eq(asaasInvoices.userId, userId), eq(asaasInvoices.id, invoiceId)))
    .limit(1);
  return record;
}

export async function upsertAsaasInvoice(data: InsertAsaasInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getAsaasInvoiceByExternalId(data.accountId, data.asaasInvoiceId);
  if (existing) {
    await db.update(asaasInvoices).set(data).where(eq(asaasInvoices.id, existing.id));
    return { ...existing, ...data };
  }
  const [created] = await db.insert(asaasInvoices).values(data).returning();
  return created;
}

export async function listAsaasEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(asaasWebhookEvents)
    .where(eq(asaasWebhookEvents.userId, userId))
    .orderBy(desc(asaasWebhookEvents.createdAt));
}

export async function getAsaasEventById(userId: number, eventId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(asaasWebhookEvents)
    .where(and(eq(asaasWebhookEvents.userId, userId), eq(asaasWebhookEvents.id, eventId)))
    .limit(1);
  return record;
}

export async function findAsaasEventByFingerprint(eventFingerprint: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [record] = await db
    .select()
    .from(asaasWebhookEvents)
    .where(eq(asaasWebhookEvents.eventFingerprint, eventFingerprint))
    .limit(1);
  return record;
}

export async function createAsaasWebhookEvent(data: InsertAsaasWebhookEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [created] = await db.insert(asaasWebhookEvents).values(data).returning();
  return created;
}

export async function updateAsaasWebhookEvent(
  eventId: number,
  data: Partial<InsertAsaasWebhookEvent>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(asaasWebhookEvents).set(data).where(eq(asaasWebhookEvents.id, eventId));
}
