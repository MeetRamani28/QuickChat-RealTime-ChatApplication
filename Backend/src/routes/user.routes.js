import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
} from "../controllers/user.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================================
   Public Routes
================================ */

// Register
// POST /api/users/register
router.post("/register", registerUser);

// Login
// POST /api/users/login
router.post("/login", loginUser);

/* ================================
   Protected Routes
================================ */

// Get current logged in user
// GET /api/users/me
router.get("/me", protect, getCurrentUser);

// Update profile
// PUT /api/users/update
router.put("/update-profile", protect, updateProfile);

export default router;
