import express from "express";
import { 
  registerUser, 
  getUserById, 
  updateUserRole, 
  getAllUsers 
} from "../controllers/userControllers.js";

const router = express.Router();

// POST /api/users/register - Register a new user
router.post("/register", registerUser);

// GET /api/users/:userId - Get user by ID
router.get("/:userId", getUserById);

// PUT /api/users/:userId/role - Update user role
router.put("/:userId/role", updateUserRole);

// GET /api/users - Get all users (for admin purposes)
router.get("/", getAllUsers);

export default router;
