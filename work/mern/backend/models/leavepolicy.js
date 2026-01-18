
const mongoose = require('mongoose');

const LeavePolicySchema=  new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    leaveTypeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'leavetype',
      required: false 
    },
    accrualRate: { type: Number, required: true },
    maxDays: { type: Number, required: true },
    carryForward: { type: Boolean, default: false },
    carryForwardLimit: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("LeavePolicy", LeavePolicySchema);