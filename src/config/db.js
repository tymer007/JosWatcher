import { neon } from "@neondatabase/serverless";

import "dotenv/config";

export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
    try {
      // Create ENUM types only if they don't exist (Neon/Postgres doesn't support IF NOT EXISTS for TYPE)
      await sql`DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_status') THEN
          CREATE TYPE alert_status AS ENUM ('pending', 'in progress', 'resolved', 'cancelled', 'escalated');
        END IF;
      END$$;`;
      await sql`DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
          CREATE TYPE alert_type AS ENUM ('Theft', 'Accidents', 'Vandalism', 'Harassment', 'Assault', 'Burglary', 'Robbery', 'Suspicious Activity', 'Public Disturbance', 'Missing Person', 'Traffic Violations', 'Fire Incidents', 'Domestic Violence', 'Drug-Related Offenses', 'Kidnapping');
        END IF;
      END$$;`;
      await sql`DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_severity') THEN
          CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
        END IF;
      END$$;`;
      await sql`DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('user', 'admin');
        END IF;
      END$$;`;
      
      // Create the users table only if it doesn't exist
      await sql`CREATE TABLE IF NOT EXISTS users(
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) NOT NULL,
          role user_role DEFAULT 'user',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`;
      
      // Create the alerts table only if it doesn't exist
      await sql`CREATE TABLE IF NOT EXISTS alerts(
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description VARCHAR(1000) NOT NULL,
          location VARCHAR(255) NOT NULL,
          coordinates JSON,
          status alert_status DEFAULT 'pending',
          type alert_type,
          severity alert_severity,
          isPublic BOOLEAN DEFAULT false,
          reportedBy VARCHAR(255),
          resolvedAt TIMESTAMP,
          resolvedBy VARCHAR(255),
          time VARCHAR(255),
          responderId VARCHAR(255),
          responseTime VARCHAR(255),
          responseActionTaken VARCHAR(255),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`;
      console.log("✅ Database tables and types verified/created successfully");
    } catch (error) {
      console.log("❌ Error initializing DB", error);
      process.exit(1);
    }
  }