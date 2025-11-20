import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://ravibharathi:Ravi2011@cluster0.lprr79i.mongodb.net/petcare";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await Admin.findOne({ email: "ravi@petcare.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Ravi@1234", 12);

    const admin = new Admin({
      email: "ravi@petcare.com",
      password: hashedPassword,
      name: "Admin User",
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

seedAdmin();
