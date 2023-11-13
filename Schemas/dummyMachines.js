const mongoose = require('mongoose');

const dummyMachinesSchema = new mongoose.Schema({
    machineId: Number,
    }, 
    { collection: 'dummyMachines', versionKey: false }
);

const dummyMachinesUpdate = mongoose.model('dummyMachines', dummyMachinesSchema);

module.exports = dummyMachinesUpdate;
