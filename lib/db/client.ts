import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL ?? "./data/assessmentos.sqlite";
const sqlite = new Database(databaseUrl);

sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export type DatabaseClient = typeof db;
