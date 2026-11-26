import app from "./app.js";
import { prisma } from "./db/prisma.js";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be configured before starting the API.");
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters.");
const port = Number(process.env.SERVER_PORT || 3001);
const server = app.listen(port, () => console.log(`Toy Shop API listening on port ${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(async () => { await prisma.$disconnect(); process.exit(0); }));
