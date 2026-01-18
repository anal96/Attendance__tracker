const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'reg',
    required: true
  },
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeavePolicy',
    required: true
  },
  leaveType: {
    type: String,
    required: true
  },
  totalDays: {
    type: Number,
    default: 0
  },
  usedDays: {
    type: Number,
    default: 0
  },
  pendingDays: {
    type: Number,
    default: 0
  },
  availableDays: {
    type: Number,
    default: 0
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  },
  carryForwardDays: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Drop old index if it exists and create new one
// Index to ensure one balance per employee per policy per year
leaveBalanceSchema.index({ employeeId: 1, policyId: 1, year: 1 }, { unique: true, name: 'employee_policy_year_unique' });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);





