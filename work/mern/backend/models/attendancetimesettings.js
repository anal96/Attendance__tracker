const mongoose = require("mongoose");

const attendanceTimeSettingsSchema = new mongoose.Schema(
  {
    // Day Shift - Check-in time window
    dayShift: {
      checkInStartTime: {
        type: String, // Format: "HH:MM" (24-hour format, e.g., "08:00")
        required: true,
        default: "08:00"
      },
      checkInEndTime: {
        type: String, // Format: "HH:MM" (e.g., "10:00")
        required: true,
        default: "10:00"
      },
      lateCheckInTime: {
        type: String, // Format: "HH:MM" (e.g., "09:15")
        required: true,
        default: "09:15"
      },
      checkOutStartTime: {
        type: String, // Format: "HH:MM" (e.g., "17:00")
        required: true,
        default: "17:00"
      },
      checkOutEndTime: {
        type: String, // Format: "HH:MM" (e.g., "20:00")
        required: true,
        default: "20:00"
      },
      earlyCheckOutTime: {
        type: String, // Format: "HH:MM" (e.g., "17:00")
        required: true,
        default: "17:00"
      }
    },
    // Night Shift - Check-in time window
    nightShift: {
      checkInStartTime: {
        type: String, // Format: "HH:MM" (e.g., "20:00" for 8 PM)
        required: true,
        default: "20:00"
      },
      checkInEndTime: {
        type: String, // Format: "HH:MM" (e.g., "22:00" for 10 PM)
        required: true,
        default: "22:00"
      },
      lateCheckInTime: {
        type: String, // Format: "HH:MM" (e.g., "21:15" for 9:15 PM)
        required: true,
        default: "21:15"
      },
      checkOutStartTime: {
        type: String, // Format: "HH:MM" (e.g., "05:00" for 5 AM next day)
        required: true,
        default: "05:00"
      },
      checkOutEndTime: {
        type: String, // Format: "HH:MM" (e.g., "08:00" for 8 AM next day)
        required: true,
        default: "08:00"
      },
      earlyCheckOutTime: {
        type: String, // Format: "HH:MM" (e.g., "05:00" for 5 AM)
        required: true,
        default: "05:00"
      }
    },
    // Settings metadata
    isActive: {
      type: Boolean,
      default: true
    },
    updatedBy: {
      type: String, // Admin user ID or name
      default: null
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Static methods and helper methods intentionally omitted for public version

module.exports = mongoose.model("AttendanceTimeSettings", attendanceTimeSettingsSchema);

