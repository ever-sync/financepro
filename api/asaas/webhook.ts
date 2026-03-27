import type { Request, Response } from "express";

let bundledAppPromise: Promise<{ default: (req: Request, res: Response) => unknown }> | null = null;

function loadBundledApp() {
  // @ts-expect-error build artifact is generated before the serverless handler runs
  bundledAppPromise ??= import("../../dist/asaas-webhook.js");
  return bundledAppPromise;
}

export default async function handler(req: Request, res: Response) {
  const { default: app } = await loadBundledApp();
  return app(req, res);
}
