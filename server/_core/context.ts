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
const AUTH_CACHE_TTL_MS = 30_000;
const authCache = new Map<string, { expiresAt: number; user: User }>();
const pendingAuthLookups = new Map<string, Promise<User | null>>();

/**
 * If there is a legacy (non-Supabase) user in the DB, migrate it to use the
 * Supabase openId. This preserves all existing data linked to that user.
 * If a new empty Supabase user was already auto-created, it gets removed first.
 */
async function migrateExistingUserIfNeeded(supabaseOpenId: string): Promise<void> {
  const legacyUser = await db.getLegacyUser();
  if (!legacyUser) return;

  if (legacyUser.openId === supabaseOpenId) return;

  await db.migrateLegacyUserToSupabase(legacyUser.id, supabaseOpenId);
  console.log(
    `[Auth] Migrated legacy user id=${legacyUser.id} openId="${legacyUser.openId}" -> "${supabaseOpenId}"`
  );
}

async function resolveAppUserFromToken(token: string): Promise<User | null> {
  const cached = authCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }

  const inFlight = pendingAuthLookups.get(token);
  if (inFlight) {
    return inFlight;
  }

  const lookup = (async () => {
    const {
      data: { user: supaAuthUser },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !supaAuthUser) return null;

    const openId = supaAuthUser.id;
    const name = supaAuthUser.user_metadata?.name || supaAuthUser.email?.split("@")[0] || "Usuario";
    const email = supaAuthUser.email ?? null;

    await migrateExistingUserIfNeeded(openId);

    await db.upsertUser({
      openId,
      name,
      email,
      loginMethod: "supabase",
      lastSignedIn: new Date(),
    });

    const appUser = await db.getUserByOpenId(openId);
    if (appUser) {
      authCache.set(token, {
        expiresAt: Date.now() + AUTH_CACHE_TTL_MS,
        user: appUser,
      });
    }

    return appUser ?? null;
  })().finally(() => {
    pendingAuthLookups.delete(token);
  });

  pendingAuthLookups.set(token, lookup);
  return lookup;
}

async function authenticateSupabaseRequest(
  req: CreateExpressContextOptions["req"]
): Promise<User | null> {
  const authHeader = (req.headers as Record<string, string | undefined>)["authorization"];
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  return resolveAppUserFromToken(token);
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authenticateSupabaseRequest(opts.req);
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
