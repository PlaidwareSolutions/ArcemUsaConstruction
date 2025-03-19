import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdminUser() {
  console.log("Starting admin user seeding process...");
  try {
    const connectionString = process.env.DATABASE_URL || "";
    if (!connectionString) {
      console.error("DATABASE_URL is not defined");
      process.exit(1);
    }

    const client = postgres(connectionString);
    const db = drizzle(client, { schema });

    // Check if admin user already exists
    const admin = await db.select().from(schema.users).where(eq(schema.users.username, "admin")).limit(1);

    if (admin && admin.length > 0) {
      console.log("Admin user already exists, skipping creation");
    } else {
      // Create admin user
      const hashedPassword = await hashPassword("adminpassword"); // Replace with a secure password
      await db.insert(schema.users).values({
        username: "admin",
        password: hashedPassword,
        role: "admin",
        email: "aj@arcemusa.com"
      });
      console.log("Admin user created successfully");
    }

    await client.end();
    console.log("Admin user seeding completed");
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

// Execute the seeding function
seedAdminUser();