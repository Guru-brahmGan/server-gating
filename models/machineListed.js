const mongoose = require('mongoose');

const machineListedSchema = new mongoose.Schema({
    machineId: Number,
    name: String,
    }, 
    { collection: 'MachineListedEvents', versionKey: false }
);

const MachineListed = mongoose.model('MachineListed', machineListedSchema);

module.exports = MachineListed;
