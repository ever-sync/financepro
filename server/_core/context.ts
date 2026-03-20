import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

async function getDevUser(): Promise<User | null> {
  const openId = process.env.OWNER_OPEN_ID || "dev-user";
  await db.upsertUser({ openId, name: "Dev User", role: "admin", lastSignedIn: new Date() });
  return (await db.getUserByOpenId(openId)) ?? null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Dev bypass: auto-login when OAuth is not configured
  if (!user && process.env.NODE_ENV === "development" && process.env.DEV_AUTO_LOGIN === "true") {
    user = await getDevUser();
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
