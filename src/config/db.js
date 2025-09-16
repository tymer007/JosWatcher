import { neon } from "@neondatabase/serverless";

import "dotenv/config";

export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
    try {
      await sql`CREATE TABLE IF NOT EXISTS alerts(
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          coordinates JSON,
          status VARCHAR(255) DEFAULT 'pending',
          type VARCHAR(255),
          resolvedAt TIMESTAMP,
          resolvedBy VARCHAR(255),
          time VARCHAR(255),
          responderId VARCHAR(255),
          responseTime VARCHAR(255),
          responseActionTaken VARCHAR(255),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`;
      console.log("DB initialized");
    } catch (error) {
      console.log("Error initializing DB", error);
      process.exit(1);
    }
  }