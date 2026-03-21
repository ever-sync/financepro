import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { settings, InsertSettings } from "../../drizzle/schema";

// ==================== SETTINGS ====================
export async function getSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSettings(data: InsertSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSettings(data.userId);
  if (existing) {
    await db.update(settings).set(data).where(eq(settings.userId, data.userId));
    return { ...existing, ...data };
  } else {
    await db.insert(settings).values(data);
    return data;
  }
}
