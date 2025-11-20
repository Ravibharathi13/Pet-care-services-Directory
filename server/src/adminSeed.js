import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

const MONGODB_URI = process.env.MONGODB_URI || "https://pet-care-services-directory-client.onrender.com/petcare";

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "ravi@petcare.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("Ravi@1234", 12);
    const admin = new Admin({
      email: "ravi@petcare.com",
      password: hashedPassword,
      name: "Admin User"
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Email: ravi@petcare.com");
    console.log("Password: Ravi@1234");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();
