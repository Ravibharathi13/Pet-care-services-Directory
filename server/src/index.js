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

// Load .env file properly on Render
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

/* -------------------------------  
   ⭐ Proper CORS for Render  
--------------------------------- */
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "https://pet-care-services-directory-client.onrender.com"
  ],
  credentials: true,              // allow cookies
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

/* -------------------------------  
   Middleware  
--------------------------------- */
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

/* -------------------------------  
   Debug Logs  
--------------------------------- */
console.log("🔍 CLIENT_URL =", process.env.CLIENT_URL);
console.log("🔍 MONGO_URI =", MONGO_URI);
console.log("🔍 NODE_ENV =", process.env.NODE_ENV);

/* -------------------------------  
   DB Connection  
--------------------------------- */
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

/* -------------------------------  
   Routes  
--------------------------------- */
app.use("/services", serviceRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/auth", authRoutes);      // Admin authentication
app.use("/user", userAuthRoutes);  // Normal user login/register

/* -------------------------------  
   Test route  
--------------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 Pet Care API is running...");
});

/* -------------------------------  
   Start Server  
--------------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
