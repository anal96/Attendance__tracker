const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { 
      type: String, 
      required: true 
    },
    employeeName: { 
      type: String, 
      default: "" 
    },
    date: { 
      type: String, 
      required: true 
    }, // YYYY-MM-DD format
    checkInTime: { 
      type: Date, 
      default: null 
    },
    checkOutTime: { 
      type: Date, 
      default: null 
    },
    workedHours: { 
      type: Number, 
      default: 0 
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "early_leave", "on_leave", "wfh", "weekend", "holiday", "half_day_leave"],
      default: "absent"
    },
    attendanceId: {
      type: String,
      unique: true
    },
    notes: { 
      type: String, 
      default: "" 
    },
    isLate: {
      type: Boolean,
      default: false
    },
    isEarlyLeave: {
      type: Boolean,
      default: false
    },
    // Check-in location data
    checkInLocation: {
      type: String,
      default: null
    },
    checkInLatitude: {
      type: Number,
      default: null
    },
    checkInLongitude: {
      type: Number,
      default: null
    },
    checkInAccuracy: {
      type: Number,
      default: null
    },
    checkInIpAddress: {
      type: String,
      default: null
    },
    // Check-out location data
    checkOutLocation: {
      type: String,
      default: null
    },
    checkOutLatitude: {
      type: Number,
      default: null
    },
    checkOutLongitude: {
      type: Number,
      default: null
    },
    checkOutAccuracy: {
      type: Number,
      default: null
    },
    checkOutIpAddress: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Index for efficient queries
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);





