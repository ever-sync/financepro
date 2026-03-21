import { eq, and, asc } from "drizzle-orm";
import { getDb } from "./db";
import { 
  clients, InsertClient,
  services, InsertService,
} from "../../drizzle/schema";
import type { PaginationParams, PaginatedResult } from "./utils/pagination";
import { calculatePagination } from "./utils/pagination";

// ==================== CLIENTS ====================
export async function getClients(
  userId: number,
  pagination?: PaginationParams
): Promise<PaginatedResult<typeof clients.$inferSelect>> {
  const db = await getDb();
  if (!db) {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } };
  }

  const safePage = Math.max(1, pagination?.page ?? 1);
  const safeLimit = Math.min(100, Math.max(1, pagination?.limit ?? 20));
  const offset = (safePage - 1) * safeLimit;

  // Count total
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(eq(clients.userId, userId));

  // Build order clause
  const sortBy = pagination?.sortBy && clients[pagination.sortBy as keyof typeof clients] 
    ? clients[pagination.sortBy as keyof typeof clients] 
    : clients.name;
  const orderDir = pagination?.sortOrder === 'desc' ? desc(sortBy) : asc(sortBy);

  const data = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(orderDir)
    .limit(safeLimit)
    .offset(offset);

  return {
    data,
    pagination: calculatePagination(Number(count), safePage, safeLimit)
  };
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
export async function getServices(
  userId: number,
  pagination?: PaginationParams
): Promise<PaginatedResult<typeof services.$inferSelect>> {
  const db = await getDb();
  if (!db) {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } };
  }

  const safePage = Math.max(1, pagination?.page ?? 1);
  const safeLimit = Math.min(100, Math.max(1, pagination?.limit ?? 20));
  const offset = (safePage - 1) * safeLimit;

  // Count total
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(services)
    .where(eq(services.userId, userId));

  // Build order clause
  const sortBy = pagination?.sortBy && services[pagination.sortBy as keyof typeof services] 
    ? services[pagination.sortBy as keyof typeof services] 
    : services.name;
  const orderDir = pagination?.sortOrder === 'desc' ? desc(sortBy) : asc(sortBy);

  const data = await db
    .select()
    .from(services)
    .where(eq(services.userId, userId))
    .orderBy(orderDir)
    .limit(safeLimit)
    .offset(offset);

  return {
    data,
    pagination: calculatePagination(Number(count), safePage, safeLimit)
  };
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
