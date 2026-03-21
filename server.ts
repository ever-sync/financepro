import "dotenv/config";
import { createApp } from "./server/_core/app";
import { serveStatic } from "./server/_core/static";

const app = createApp();
serveStatic(app);

export default app;
