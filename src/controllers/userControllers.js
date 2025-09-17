import { sql } from "../config/db.js";

export async function registerUser(req, res) {
  try {
    console.log("📥 Backend received user registration request:", JSON.stringify(req.body, null, 2));
    
    const {
      user_id,
      email,
      role = 'user' // Default to 'user' role
    } = req.body;

    // Validate required fields
    if (!user_id || !email) {
      console.log("❌ Missing required fields:", {
        user_id: !!user_id,
        email: !!email
      });
      return res.status(400).json({ message: "user_id and email are required" });
    }

    // Validate role if provided
    const validRoles = ['user', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        message: "Invalid role", 
        validRoles: validRoles 
      });
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE user_id = ${user_id}
    `;

    if (existingUser.length > 0) {
      console.log("⚠️ User already exists:", user_id);
      return res.status(409).json({ 
        message: "User already exists",
        user: existingUser[0]
      });
    }

    // Insert new user
    const newUser = await sql`
      INSERT INTO users (user_id, email, role)
      VALUES (${user_id}, ${email}, ${role})
      RETURNING *
    `;

    console.log("✅ User registered successfully:", newUser[0]);
    return res.status(201).json({ 
      message: "User registered successfully", 
      user: newUser[0] 
    });

  } catch (error) {
    console.log("Error registering user", error);
    
    // Handle specific enum errors
    if (error.code === '22P02' && error.message.includes('enum')) {
      return res.status(400).json({ 
        message: "Invalid role value", 
        validRoles: ['user', 'admin']
      });
    }
    
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserById(req, res) {
  try {
    const { userId } = req.params;
    
    const user = await sql`
      SELECT * FROM users WHERE user_id = ${userId}
    `;

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: user[0] });
  } catch (error) {
    console.log("Error getting user", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        message: "Invalid role", 
        validRoles: validRoles 
      });
    }

    const updatedUser = await sql`
      UPDATE users 
      SET role = ${role}, updatedAt = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING *
    `;

    if (updatedUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
      message: "User role updated successfully", 
      user: updatedUser[0] 
    });
  } catch (error) {
    console.log("Error updating user role", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await sql`
      SELECT user_id, email, role, createdAt, updatedAt 
      FROM users 
      ORDER BY createdAt DESC
    `;
    
    return res.status(200).json({ users });
  } catch (error) {
    console.log("Error getting all users", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
