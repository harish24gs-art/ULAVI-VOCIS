import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import conversationRoutes from "./routes/conversationRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.APP_BASE_URL || true }));
app.use(express.json({ limit: "16mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    services: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      sendgrid: Boolean(process.env.SENDGRID_API_KEY),
      twilio: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    },
    timestamp: new Date().toISOString()
  });
});

app.use("/api/conversation", conversationRoutes);
app.use("/api/leads", leadRoutes);

const distPath = path.resolve(__dirname, "..", process.env.FRONTEND_DIST || "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.use(errorHandler);

const server = app.listen(port, host, () => {
  console.log(`Ulavi Vocis API listening on http://${host}:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. The Ulavi Vocis backend is probably already running at http://${host}:${port}.`);
    console.error(`Stop the existing Node process first, or run with another port: PORT=3001 npm run dev:backend`);
    process.exit(0);
  }
  throw error;
});
