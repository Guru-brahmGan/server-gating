const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema({
    username: String,
    GPUname: String,
    Quantity: Number,
    }, 
    { collection: 'CustomRequest', versionKey: false }
);

const customRequestUpdate = mongoose.model('customRequest', customRequestSchema);

module.exports = customRequestUpdate;