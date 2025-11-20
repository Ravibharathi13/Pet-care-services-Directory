import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ============================================================
    ⭐ USER REGISTRATION
============================================================ */
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists with this email" });

    const user = new User({ name, email, password, phone });
    await user.save();

    const token = jwt.sign(
      { id: user._id, type: "user" },
      process.env.JWT_SECRET || "your-super-secret-jwt-key-here",
      { expiresIn: "7d" }
    );

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/* ============================================================
    ⭐ USER LOGIN
============================================================ */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, type: "user" },
      process.env.JWT_SECRET || "your-super-secret-jwt-key-here",
      { expiresIn: "7d" }
    );

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

/* ============================================================
    ⭐ USER LOGOUT
============================================================ */
router.post("/logout", (req, res) => {
  res.clearCookie("userToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ message: "Logged out successfully" });
});

/* ============================================================
    ⭐ GET CURRENT USER (/user/me)
============================================================ */
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.userToken;

    if (!token)
      return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-super-secret-jwt-key-here"
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ user });

  } catch (err) {
    console.error("User /me error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
