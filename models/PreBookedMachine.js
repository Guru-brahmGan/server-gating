const mongoose = require('mongoose');
const PreBookedMachineSchema = new mongoose.Schema({
    username: String,
    machineId: String,
    duration: Number
  });
  
  module.exports = mongoose.model('PreBookedMachine', PreBookedMachineSchema);