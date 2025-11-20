import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import serviceRoutes from "./routes/service.js";
import analyticsRoutes from "./routes/analytics.js";
import authRoutes from "./routes/auth.js";
import userAuthRoutes from "./routes/userAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath, override: true }); // ensure we load server/.env explicitly

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "https://pet-care-services-directory-client.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Debugging log
console.log("🔍 ENV PATH =", envPath);
console.log("🔍 CWD =", process.cwd());
console.log("🔍 MONGO_URI =", MONGO_URI);

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1); // stop server if no DB URI
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB connection error:", err);
    process.exit(1); // exit if DB connection fails
  }
};

connectDB();

// Routes
app.use("/services", serviceRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/auth", authRoutes);
app.use("/user", userAuthRoutes);

// Simple route
app.get("/", (req, res) => {
  res.send("🚀 Pet Care API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
