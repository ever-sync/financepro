import type { Request, Response } from "express";

let bundledAppPromise: Promise<{ default: (req: Request, res: Response) => unknown }> | null = null;

function loadBundledApp() {
  bundledAppPromise ??= import("../../dist/trpc-vercel.js");
  return bundledAppPromise;
}

export default async function handler(req: Request, res: Response) {
  const { default: app } = await loadBundledApp();
  return app(req, res);
}
