import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import passport from "../config/passport.js";

const router = express.Router();

// Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || "your-super-secret-jwt-key-here", { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin-only: create a new admin
router.post("/admins", authMiddleware, async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const admin = new Admin({ email, password: hashed, name: name || "Admin" });
    await admin.save();

    return res.status(201).json({ id: admin._id, email: admin.email, name: admin.name });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Get current admin (verify JWT)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("_id name email");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/admin/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated admin
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET || "your-super-secret-jwt-key-here",
        { expiresIn: "1d" }
      );
      
      res.cookie("token", token, { httpOnly: true });
      res.redirect('/admin?login=success');
    } catch (error) {
      res.redirect('/admin/login?error=token_generation_failed');
    }
  }
);

// Admin logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  req.logout((err) => {
    if (err) console.error('Logout error:', err);
  });
  res.json({ message: "Logged out" });
});

export default router;
