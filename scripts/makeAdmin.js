import { sql } from "../config/db.js";
import "dotenv/config";

// Script to make a user an admin
// Usage: node scripts/makeAdmin.js <user_id>

const userId = process.argv[2];

if (!userId) {
  console.log("❌ Usage: node scripts/makeAdmin.js <user_id>");
  process.exit(1);
}

async function makeAdmin() {
  try {
    console.log(`🔍 Looking for user: ${userId}`);
    
    // Check if user exists
    const user = await sql`
      SELECT * FROM users WHERE user_id = ${userId}
    `;

    if (user.length === 0) {
      console.log("❌ User not found. Please make sure the user_id is correct.");
      process.exit(1);
    }

    console.log("👤 Found user:", user[0]);

    // Update user role to admin
    const updatedUser = await sql`
      UPDATE users 
      SET role = 'admin', updatedAt = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING *
    `;

    console.log("✅ User role updated to admin:", updatedUser[0]);
    console.log("🎉 User is now an admin!");

  } catch (error) {
    console.error("❌ Error making user admin:", error);
    process.exit(1);
  }
}

makeAdmin();
