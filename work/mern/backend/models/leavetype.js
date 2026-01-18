const mongoose = require('mongoose');

const leavetypeSchema = new mongoose.Schema({
   leaveid: String,
    type: { type: String, unique: true, required: true },
});

module.exports = mongoose.model('leavetype', leavetypeSchema);      
