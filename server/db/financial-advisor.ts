import { and, desc, eq } from "drizzle-orm";
import {
  financialAdvisorSnapshots,
  type InsertFinancialAdvisorSnapshot,
} from "../../drizzle/schema";
import { getDb } from "../db";

export async function getFinancialAdvisorSnapshotByKey(
  userId: number,
  snapshotType: string,
  referenceDate: string
) {
  const db = await getDb();
  if (!db) return undefined;

  const [record] = await db
    .select()
    .from(financialAdvisorSnapshots)
    .where(
      and(
        eq(financialAdvisorSnapshots.userId, userId),
        eq(financialAdvisorSnapshots.snapshotType, snapshotType),
        eq(financialAdvisorSnapshots.referenceDate, referenceDate)
      )
    )
    .limit(1);

  return record;
}

export async function upsertFinancialAdvisorSnapshot(data: InsertFinancialAdvisorSnapshot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getFinancialAdvisorSnapshotByKey(
    data.userId,
    data.snapshotType,
    data.referenceDate
  );

  if (existing) {
    await db
      .update(financialAdvisorSnapshots)
      .set(data)
      .where(eq(financialAdvisorSnapshots.id, existing.id));
    return { ...existing, ...data };
  }

  const [created] = await db.insert(financialAdvisorSnapshots).values(data).returning();
  return created;
}

export async function listFinancialAdvisorSnapshots(userId: number, snapshotType?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(financialAdvisorSnapshots.userId, userId)];
  if (snapshotType) {
    conditions.push(eq(financialAdvisorSnapshots.snapshotType, snapshotType));
  }

  return db
    .select()
    .from(financialAdvisorSnapshots)
    .where(and(...conditions))
    .orderBy(desc(financialAdvisorSnapshots.referenceDate), desc(financialAdvisorSnapshots.createdAt));
}
