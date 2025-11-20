import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import passport from "../config/passport.js";

const router = express.Router();

/* ============================================================
   ⭐ ADMIN LOGIN  →  sets cookie: adminToken
============================================================ */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, type: "admin" },
      process.env.JWT_SECRET || "your-super-secret-jwt-key-here",
      { expiresIn: "1d" }
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Admin login successful",
      token,
    });

  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================================
   ⭐ CREATE NEW ADMIN (protected route)
============================================================ */
router.post("/admins", authMiddleware, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const exists = await Admin.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 12);

    const admin = new Admin({ email, password: hashed, name });
    await admin.save();

    res.status(201).json({
      id: admin._id,
      email: admin.email,
      name: admin.name,
    });

  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================================
   ⭐ GET CURRENT ADMIN  (/auth/me)
============================================================ */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("_id name email");
    if (!admin)
      return res.status(404).json({ message: "Admin not found" });

    res.json({ admin });

  } catch (err) {
    console.error("Admin /me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================================
   ⭐ GOOGLE OAUTH
============================================================ */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/admin/login?error=oauth_failed",
  }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id, type: "admin" },
        process.env.JWT_SECRET || "your-super-secret-jwt-key-here",
        { expiresIn: "1d" }
      );

      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.redirect("/admin?login=success");

    } catch (error) {
      res.redirect("/admin/login?error=token_failed");
    }
  }
);

/* ============================================================
   ⭐ LOGOUT
============================================================ */
router.post("/logout", (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  if (req.logout) {
    req.logout((err) => {
      if (err) console.error("Logout error:", err);
    });
  }

  res.json({ message: "Logged out" });
});

export default router;
