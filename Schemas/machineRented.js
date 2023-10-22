const mongoose = require('mongoose');

const machineRentedSchema = new mongoose.Schema({
    orderId: Number,
    machineId: Number,
    renter: String
    }, 
    { collection: 'MachineRentedEvents', versionKey: false }
);

const MachineRented = mongoose.model('MachineRented', machineRentedSchema);

module.exports = MachineRented;
