import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // hashed password - optional for OAuth users
  name: { type: String },
  googleId: { type: String }, // for Google OAuth
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

export default mongoose.model("Admin", adminSchema);
