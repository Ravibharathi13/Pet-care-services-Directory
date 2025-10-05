import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  ip: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userEmail: String,
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  visitedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Analytics", analyticsSchema);
