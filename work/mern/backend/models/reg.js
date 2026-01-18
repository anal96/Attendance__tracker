const mongoose = require("mongoose");

const regSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, sparse: true },
  name: String,
  password: String,
  email: String,
  age: Number,
  qualification: String,
  experience: Number,
  address: String,
  phone: Number,
  usertype: String,
  department: String,
  status: String,
  joinDate: String,
  profilePic: { type: String, default: "" },
  shift: {
    type: String,
    enum: ["day", "night"],
    default: "day"
  },
  termsAccepted: {
    type: Boolean,
    default: false
  },
  termsAcceptedDate: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  },
  emailVerificationOtp: {
    type: String,
    default: null
  },
  emailVerificationOtpExpires: {
    type: Date,
    default: null
  },
  emailVerificationOtpAttempts: {
    type: Number,
    default: 0
  },
  emailVerificationLastSentAt: {
    type: Date,
    default: null
  },
  passwordResetOtp: {
    type: String,
    default: null
  },
  passwordResetOtpExpires: {
    type: Date,
    default: null
  },
  passwordResetOtpAttempts: {
    type: Number,
    default: 0
  },
  passwordResetLastSentAt: {
    type: Date,
    default: null
  },
  // User Settings
  settings: {
    preferences: {
      language: { type: String, default: "en" },
      timezone: { type: String, default: "America/New_York" },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      leaveReminders: { type: Boolean, default: true }
    },
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      sessionTimeout: { type: String, default: "30" },
      passwordLastChanged: { type: String, default: "" }
    }
  }
});

module.exports = mongoose.model("reg", regSchema);
