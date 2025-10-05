import express from "express";
import Service from "../models/Service.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public - Get all services (district-wise)
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Error fetching services" });
  }
});

// Public - Get services by district
router.get("/district/:district", async (req, res) => {
  try {
    const services = await Service.find({ district: req.params.district });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Error fetching services by district" });
  }
});

// Admin - Add new service
router.post("/", authMiddleware, async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: "Error adding service" });
  }
});

// Admin - Update service
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Error updating service" });
  }
});

// Admin - Delete service
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting service" });
  }
});

export default router;
