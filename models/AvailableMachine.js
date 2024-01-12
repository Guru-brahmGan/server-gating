const mongoose = require('mongoose');

const AvailableMachineSchema = new mongoose.Schema({
  machineId: String,
  name: String,
  memory: String,
  region: String
});

module.exports = mongoose.model('AvailableMachine', AvailableMachineSchema);