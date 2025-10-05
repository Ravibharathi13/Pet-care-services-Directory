import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  district: { 
    type: String, 
    enum: [
      // Full Tamil Nadu districts list (38)
      "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
      "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram",
      "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
      "Nagapattinam", "Namakkal", "Perambalur", "Pudukkottai", "Ramanathapuram",
      "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni",
      "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
      "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar",
      "The Nilgiris", "Thoothukudi"
    ], 
    required: true 
  },
  address: String,
  phone: String,
  latitude: Number,
  longitude: Number,
  services: String, // Services offered (grooming, vaccination, etc.)
  serviceDetails: [
    {
      name: { type: String }, // e.g., Vaccination, Grooming, Surgery
      price: { type: Number }, // e.g., 500
      currency: { type: String, default: "INR" }, // default currency
      unit: { type: String } // e.g., per visit, per dose
    }
  ],
  rating: { type: Number, min: 1, max: 5 }, // Rating from 1-5
  hours: String, // Operating hours
}, {
  timestamps: true
});

export default mongoose.model("Service", serviceSchema);
