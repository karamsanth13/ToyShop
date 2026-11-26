import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import path from "node:path";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admins.js";
import catalogueRoutes from "./routes/catalogue.js";
import shopRoutes from "./routes/shop.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const clientSocketOrigin = new URL(clientOrigin);
clientSocketOrigin.protocol = clientSocketOrigin.protocol === "https:" ? "wss:" : "ws:";
app.disable("x-powered-by");
const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
app.set("trust proxy", Number.isSafeInteger(proxyHops) && proxyHops > 0 ? proxyHops : false);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
    frameSrc: ["https://www.google.com", "https://maps.google.com"],
    connectSrc: ["'self'", clientOrigin, clientSocketOrigin.origin],
  } },
}));
app.use(cors({ origin: clientOrigin, credentials: true, methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"] }));
app.use((req, res, next) => { if (["POST", "PATCH", "DELETE", "PUT"].includes(req.method) && req.headers.origin !== clientOrigin) return res.status(403).json({ error: { code: "ORIGIN_REJECTED", message: "Request origin is not allowed." } }); next(); });
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.get("/api/health", (_req, res) => res.json({ data: { status: "ok" } }));
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/catalogue", catalogueRoutes);
app.use("/api", catalogueRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/admin", shopRoutes);
app.use("/api", notFound);
const root = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(root, "../client/build");
app.use(express.static(buildDir, { index: false }));
app.get(/.*/, (_req, res, next) => res.sendFile(path.join(buildDir, "index.html"), (error) => error && next()));
app.use(errorHandler);
export default app;
