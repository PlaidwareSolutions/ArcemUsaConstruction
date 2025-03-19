import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../shared/schema.js";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function updateAdminPassword() {
  console.log("Starting admin password update process...");
  try {
    const connectionString = process.env.DATABASE_URL || "";
    if (!connectionString) {
      console.error("DATABASE_URL is not defined");
      process.exit(1);
    }

    const client = postgres(connectionString);
    const db = drizzle(client, { schema });

    // Check if admin user exists
    const admin = await db.select().from(schema.users).where(eq(schema.users.username, "admin")).limit(1);

    if (admin && admin.length > 0) {
      // Update admin password
      const hashedPassword = await hashPassword("adminpassword");
      await db.update(schema.users)
        .set({ password: hashedPassword })
        .where(eq(schema.users.username, "admin"));
      
      console.log("Admin password updated successfully to 'adminpassword'");
    } else {
      console.log("Admin user does not exist, please run seed-admin.ts first");
    }

    await client.end();
    console.log("Admin password update completed");
  } catch (error) {
    console.error("Error updating admin password:", error);
    process.exit(1);
  }
}

// Execute the update function
updateAdminPassword();