import mongoose from "mongoose";

const reportConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['analytics', 'services', 'districts', 'custom'], required: true },
  filters: {
    dateRange: {
      start: { type: Date },
      end: { type: Date }
    },
    districts: [{ type: String }],
    serviceTypes: [{ type: String }],
    ratingRange: {
      min: { type: Number, min: 0, max: 5 },
      max: { type: Number, min: 0, max: 5 }
    }
  },
  fields: [{ type: String }], // Fields to include in report
  groupBy: { type: String }, // Field to group results by
  sortBy: { type: String, default: 'createdAt' },
  sortOrder: { type: String, enum: ['asc', 'desc'], default: 'desc' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  lastGenerated: { type: Date }
});

const reportInstanceSchema = new mongoose.Schema({
  configId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportConfig', required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // Generated report data
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  generatedAt: { type: Date, default: Date.now },
  format: { type: String, enum: ['json', 'csv', 'pdf'], default: 'json' },
  status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'completed' }
});

export const ReportConfig = mongoose.model("ReportConfig", reportConfigSchema);
export const ReportInstance = mongoose.model("ReportInstance", reportInstanceSchema);
