import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

/**
 * On first Supabase login, if the new user doesn't exist in our DB yet but
 * there is exactly one legacy user, migrate that legacy user's openId to the
 * Supabase user's id so all existing data stays linked.
 */
async function migrateExistingUserIfNeeded(supabaseOpenId: string): Promise<void> {
  const existing = await db.getUserByOpenId(supabaseOpenId);
  if (existing) return; // already migrated or already exists

  const legacyUser = await db.getSingleLegacyUser();
  if (!legacyUser) return; // no legacy user to migrate

  await db.updateUserOpenId(legacyUser.id, supabaseOpenId);
  console.log(`[Auth] Migrated legacy user id=${legacyUser.id} openId="${legacyUser.openId}" → "${supabaseOpenId}"`);
}

async function authenticateSupabaseRequest(
  req: CreateExpressContextOptions["req"]
): Promise<User | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  const supaUser = data.user;
  const openId = supaUser.id;
  const name = supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "Usuário";
  const email = supaUser.email ?? null;

  // Migrate legacy user data if this is the first Supabase login
  await migrateExistingUserIfNeeded(openId);

  // Upsert into our users table and return the app user
  await db.upsertUser({
    openId,
    name,
    email,
    loginMethod: "supabase",
    lastSignedIn: new Date(),
  });

  return (await db.getUserByOpenId(openId)) ?? null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authenticateSupabaseRequest(opts);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
