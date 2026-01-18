// models/LeaveApplication.js
const mongoose = require("mongoose");

const LeaveApplicationSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "reg" },
    leavetype: { type: mongoose.Schema.Types.ObjectId, ref: "leavetype" }, // ✅ correct ref
    startDate: String,
    endDate: String,
    days: Number,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "draft"],
      default: "pending",
    },
    reason: String,
    appliedDate: String,
    handoverNotes: String,
    contactInfo: String,
    needsSubstitute: Boolean,
    substitute: { type: mongoose.Schema.Types.ObjectId, ref: "reg" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveApplication", LeaveApplicationSchema);
console.log("LeaveApplication model loaded.");
