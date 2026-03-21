import { eq, and, asc } from "drizzle-orm";
import { getDb } from "./db";
import { 
  clients, InsertClient,
  services, InsertService,
} from "../../drizzle/schema";

// ==================== CLIENTS ====================
export async function getClients(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, userId)).orderBy(asc(clients.name));
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(clients).values(data).returning({ id: clients.id });
  return { id: inserted.id, ...data };
}

export async function updateClient(id: number, userId: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(and(eq(clients.id, id), eq(clients.userId, userId)));
}

export async function deleteClient(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, userId)));
}

// ==================== SERVICES ====================
export async function getServices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).where(eq(services.userId, userId)).orderBy(asc(services.name));
}

export async function createService(data: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(services).values(data).returning({ id: services.id });
  return { id: inserted.id, ...data };
}

export async function updateService(id: number, userId: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(services).set(data).where(and(eq(services.id, id), eq(services.userId, userId)));
}

export async function deleteService(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(services).where(and(eq(services.id, id), eq(services.userId, userId)));
}
