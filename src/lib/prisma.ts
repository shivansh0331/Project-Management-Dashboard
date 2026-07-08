import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import path from "path";

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;
let dbUrl: string;

if (process.env.NODE_ENV === "production") {
  const srcPath = path.join(process.cwd(), "dev.db");
  const destPath = "/tmp/dev.db";

  if (!fs.existsSync(destPath)) {
    try {
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        fs.chmodSync(destPath, 0o666);
        console.log("Database successfully copied to /tmp/dev.db");
      } else {
        console.error("Source database not found at:", srcPath);
      }
    } catch (e) {
      console.error("Error copying database to /tmp:", e);
    }
  }
  dbUrl = `file:${destPath}`;
} else {
  dbUrl = "file:./dev.db";
}

if (process.env.NODE_ENV === "production") {
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) {
    const adapter = new PrismaBetterSqlite3({ url: dbUrl });
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

export { prisma };
