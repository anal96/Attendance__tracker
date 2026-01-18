const mongoose = require("mongoose");

const wfhSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reg",
      required: true,
      unique: true
    },
    employeeName: {
      type: String,
      required: true
    },
    employeeEmail: {
      type: String,
      required: true
    },
    // Home address details
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      default: null
    },
    // Exact coordinates for verification
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    accuracy: {
      type: Number,
      default: null // GPS accuracy in meters
    },
    // Location verification threshold (in meters)
    // Default 500m (1/2 km)
    threshold: {
      type: Number,
      default: 500
    },
    // Verification status
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reg",
      default: null
    },
    // Spoofing detection
    spoofingAlerts: [{
      date: {
        type: Date,
        default: Date.now
      },
      checkInLocation: {
        type: String,
        required: true
      },
      checkInLatitude: {
        type: Number,
        required: true
      },
      checkInLongitude: {
        type: Number,
        required: true
      },
      distance: {
        type: Number,
        required: true // Distance in meters
      },
      alertSent: {
        type: Boolean,
        default: false
      },
      alertSentAt: {
        type: Date,
        default: null
      }
    }],
    // Manager assignment (who manages this employee)
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reg",
      default: null
    },
    // Active status
    isActive: {
      type: Boolean,
      default: true
    },
    // Last updated
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    // Update request workflow
    updateRequest: {
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none"
      },
      requestedAt: {
        type: Date,
        default: null
      },
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reg",
        default: null
      },
      // Proposed changes
      proposedAddress: {
        type: String,
        default: null
      },
      proposedCity: {
        type: String,
        default: null
      },
      proposedState: {
        type: String,
        default: null
      },
      proposedCountry: {
        type: String,
        default: null
      },
      proposedPostalCode: {
        type: String,
        default: null
      },
      proposedLatitude: {
        type: Number,
        default: null
      },
      proposedLongitude: {
        type: Number,
        default: null
      },
      proposedAccuracy: {
        type: Number,
        default: null
      },
      // Approval details
      reviewedAt: {
        type: Date,
        default: null
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reg",
        default: null
      },
      reviewComments: {
        type: String,
        default: null
      }
    }
  },
  { timestamps: true }
);

// Index for efficient queries
wfhSchema.index({ employeeId: 1 });
wfhSchema.index({ managerId: 1 });
wfhSchema.index({ isActive: 1 });
wfhSchema.index({ "spoofingAlerts.date": -1 });

module.exports = mongoose.model("WFH", wfhSchema);





