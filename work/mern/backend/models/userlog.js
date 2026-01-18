const mongoose = require('mongoose');

const userLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'reg',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    required: true
  },
  action: {
    type: String,
    enum: ['login', 'logout'],
    required: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  failureReason: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  accuracy: {
    type: Number,
    default: null // GPS accuracy in meters
  }
}, {
  timestamps: true
});

// Index for faster queries
userLogSchema.index({ userId: 1, timestamp: -1 });
userLogSchema.index({ action: 1, timestamp: -1 });
userLogSchema.index({ userType: 1, timestamp: -1 });

module.exports = mongoose.model('UserLog', userLogSchema);

