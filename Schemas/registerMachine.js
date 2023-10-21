const mongoose = require('mongoose');

const registerMachineSchema = new mongoose.Schema({
    machineId: Number,
    name: String,
    }, 
    { collection: 'RegisterMachine', versionKey: false }
);

const RegisterMachine = mongoose.model('RegisterMachine', registerMachineSchema);

module.exports = RegisterMachine;
