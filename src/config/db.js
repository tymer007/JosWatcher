import { neon } from "@neondatabase/serverless";

import "dotenv/config";

export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
    try {
      // Drop existing table and ENUM types to start fresh
      await sql`DROP TABLE IF EXISTS alerts CASCADE`;
      await sql`DROP TYPE IF EXISTS alert_status CASCADE`;
      await sql`DROP TYPE IF EXISTS alert_type CASCADE`;
      await sql`DROP TYPE IF EXISTS alert_severity CASCADE`;
      
      // Create ENUM types with correct values
      await sql`CREATE TYPE alert_status AS ENUM ('pending', 'in progress', 'resolved', 'cancelled', 'escalated')`;
      await sql`CREATE TYPE alert_type AS ENUM ('Theft', 'Accidents', 'Vandalism', 'Harassment', 'Assault', 'Burglary', 'Robbery', 'Suspicious Activity', 'Public Disturbance', 'Missing Person', 'Traffic Violations', 'Fire Incidents', 'Domestic Violence', 'Drug-Related Offenses', 'Kidnapping')`;
      await sql`CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical')`;
      
      // Create the alerts table with ENUM types
      await sql`CREATE TABLE alerts(
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
      console.log("DB initialized with ENUM types and alerts table");
    } catch (error) {
      console.log("Error initializing DB", error);
      process.exit(1);
    }
  }