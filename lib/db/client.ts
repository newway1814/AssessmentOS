import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL ?? "./data/assessmentos.sqlite";

if (databaseUrl !== ":memory:") {
  mkdirSync(dirname(databaseUrl), { recursive: true });
}

const sqlite = new Database(databaseUrl);

sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export type DatabaseClient = typeof db;
