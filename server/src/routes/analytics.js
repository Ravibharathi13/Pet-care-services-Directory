import express from "express";
import jwt from "jsonwebtoken";
import Analytics from "../models/Analytics.js";
import User from "../models/User.js";

const router = express.Router();

// Record visit
router.post("/track", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    
    // Check if user is authenticated
    let userId = null;
    let userEmail = null;
    let isAuthenticated = false;
    
    const token = req.cookies.userToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_key_123");
        if (decoded.type === 'user') {
          const user = await User.findById(decoded.id);
          if (user) {
            userId = user._id;
            userEmail = user.email;
            isAuthenticated = true;
          }
        }
      } catch (jwtError) {
        // Token invalid, continue as anonymous
      }
    }
    
    const record = new Analytics({ 
      ip, 
      userId, 
      userEmail, 
      isAuthenticated 
    });
    await record.save();
    res.json({ message: "Visit tracked" });
  } catch (err) {
    res.status(500).json({ message: "Error tracking visit" });
  }
});

// Admin - Get analytics statistics
router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalVisits, 
      todayVisits, 
      weeklyVisits,
      authenticatedVisits,
      anonymousVisits,
      uniqueUsers
    ] = await Promise.all([
      Analytics.countDocuments(),
      Analytics.countDocuments({ visitedAt: { $gte: today } }),
      Analytics.countDocuments({ visitedAt: { $gte: weekAgo } }),
      Analytics.countDocuments({ isAuthenticated: true }),
      Analytics.countDocuments({ isAuthenticated: false }),
      Analytics.distinct('userId', { isAuthenticated: true }).then(users => users.length)
    ]);

    res.json({
      totalVisits,
      todayVisits,
      weeklyVisits,
      authenticatedVisits,
      anonymousVisits,
      uniqueUsers
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics stats" });
  }
});

// Admin - Get all visits
router.get("/", async (req, res) => {
  try {
    const visits = await Analytics.find()
      .populate('userId', 'name email')
      .sort({ visitedAt: -1 });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics" });
  }
});

export default router;
