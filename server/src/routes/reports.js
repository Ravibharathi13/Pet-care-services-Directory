import express from "express";
import Service from "../models/Service.js";
import Analytics from "../models/Analytics.js";
import { ReportConfig, ReportInstance } from "../models/Report.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all report configurations
router.get("/configs", authMiddleware, async (req, res) => {
  try {
    const configs = await ReportConfig.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching report configurations" });
  }
});

// Create new report configuration
router.post("/configs", authMiddleware, async (req, res) => {
  try {
    const config = new ReportConfig({
      ...req.body,
      createdBy: req.admin.id
    });
    await config.save();
    await config.populate('createdBy', 'name email');
    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ message: "Error creating report configuration" });
  }
});

// Update report configuration
router.put("/configs/:id", authMiddleware, async (req, res) => {
  try {
    const config = await ReportConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'name email');
    
    if (!config) {
      return res.status(404).json({ message: "Report configuration not found" });
    }
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Error updating report configuration" });
  }
});

// Delete report configuration
router.delete("/configs/:id", authMiddleware, async (req, res) => {
  try {
    await ReportConfig.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Report configuration deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report configuration" });
  }
});

// Generate report based on configuration
router.post("/generate/:configId", authMiddleware, async (req, res) => {
  try {
    const config = await ReportConfig.findById(req.params.configId);
    if (!config) {
      return res.status(404).json({ message: "Report configuration not found" });
    }

    let reportData = {};

    switch (config.type) {
      case 'analytics':
        reportData = await generateAnalyticsReport(config);
        break;
      case 'services':
        reportData = await generateServicesReport(config);
        break;
      case 'districts':
        reportData = await generateDistrictsReport(config);
        break;
      case 'custom':
        reportData = await generateCustomReport(config);
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    const reportInstance = new ReportInstance({
      configId: config._id,
      data: reportData,
      generatedBy: req.admin.id,
      format: req.body.format || 'json'
    });

    await reportInstance.save();
    
    // Update last generated timestamp
    config.lastGenerated = new Date();
    await config.save();

    res.json({
      reportId: reportInstance._id,
      data: reportData,
      generatedAt: reportInstance.generatedAt
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: "Error generating report" });
  }
});

// Get report instances
router.get("/instances", authMiddleware, async (req, res) => {
  try {
    const { configId, limit = 10 } = req.query;
    const query = configId ? { configId } : {};
    
    const instances = await ReportInstance.find(query)
      .populate('configId', 'name type')
      .populate('generatedBy', 'name email')
      .sort({ generatedAt: -1 })
      .limit(parseInt(limit));
      
    res.json(instances);
  } catch (error) {
    res.status(500).json({ message: "Error fetching report instances" });
  }
});

// Helper functions for generating different types of reports
async function generateAnalyticsReport(config) {
  const { filters } = config;
  const matchStage = {};

  if (filters.dateRange?.start || filters.dateRange?.end) {
    matchStage.visitedAt = {};
    if (filters.dateRange.start) matchStage.visitedAt.$gte = new Date(filters.dateRange.start);
    if (filters.dateRange.end) matchStage.visitedAt.$lte = new Date(filters.dateRange.end);
  }

  const [totalVisits, dailyStats, hourlyStats] = await Promise.all([
    Analytics.countDocuments(matchStage),
    Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" } },
          visits: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $hour: "$visitedAt" },
          visits: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  return {
    summary: { totalVisits },
    dailyStats,
    hourlyStats,
    generatedAt: new Date()
  };
}

async function generateServicesReport(config) {
  const { filters } = config;
  const matchStage = {};

  if (filters.districts?.length) {
    matchStage.district = { $in: filters.districts };
  }

  if (filters.ratingRange?.min !== undefined || filters.ratingRange?.max !== undefined) {
    matchStage.rating = {};
    if (filters.ratingRange.min !== undefined) matchStage.rating.$gte = filters.ratingRange.min;
    if (filters.ratingRange.max !== undefined) matchStage.rating.$lte = filters.ratingRange.max;
  }

  const [services, districtStats, ratingStats] = await Promise.all([
    Service.find(matchStage).sort({ [config.sortBy]: config.sortOrder === 'desc' ? -1 : 1 }),
    Service.aggregate([
      { $match: matchStage },
      { $group: { _id: "$district", count: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
      { $sort: { count: -1 } }
    ]),
    Service.aggregate([
      { $match: matchStage },
      { $group: { _id: { $floor: "$rating" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  return {
    summary: {
      totalServices: services.length,
      averageRating: services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length
    },
    services: config.fields?.length ? 
      services.map(s => {
        const filtered = {};
        config.fields.forEach(field => {
          if (s[field] !== undefined) filtered[field] = s[field];
        });
        return filtered;
      }) : services,
    districtStats,
    ratingStats,
    generatedAt: new Date()
  };
}

async function generateDistrictsReport(config) {
  const { filters } = config;
  const matchStage = {};

  if (filters.districts?.length) {
    matchStage.district = { $in: filters.districts };
  }

  const districtData = await Service.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$district",
        totalCenters: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        services: { $push: "$services" },
        topRatedCenter: { $max: { rating: "$rating", name: "$name" } }
      }
    },
    { $sort: { totalCenters: -1 } }
  ]);

  return {
    summary: {
      totalDistricts: districtData.length,
      totalCenters: districtData.reduce((sum, d) => sum + d.totalCenters, 0)
    },
    districts: districtData,
    generatedAt: new Date()
  };
}

async function generateCustomReport(config) {
  // Custom report logic based on configuration
  const { filters, fields, groupBy } = config;
  
  const pipeline = [];
  const matchStage = {};

  // Apply filters
  if (filters.districts?.length) matchStage.district = { $in: filters.districts };
  if (filters.ratingRange?.min !== undefined || filters.ratingRange?.max !== undefined) {
    matchStage.rating = {};
    if (filters.ratingRange.min !== undefined) matchStage.rating.$gte = filters.ratingRange.min;
    if (filters.ratingRange.max !== undefined) matchStage.rating.$lte = filters.ratingRange.max;
  }

  if (Object.keys(matchStage).length) {
    pipeline.push({ $match: matchStage });
  }

  // Group by specified field
  if (groupBy) {
    pipeline.push({
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        items: { $push: "$$ROOT" }
      }
    });
  }

  // Sort
  pipeline.push({ $sort: { [config.sortBy || 'count']: config.sortOrder === 'desc' ? -1 : 1 } });

  const data = await Service.aggregate(pipeline);

  return {
    data,
    generatedAt: new Date(),
    config: {
      filters,
      fields,
      groupBy
    }
  };
}

export default router;
