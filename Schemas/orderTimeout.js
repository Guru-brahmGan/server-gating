const mongoose = require('mongoose');

const orderTimeoutSchema = new mongoose.Schema({
    orderId: Number,
    revokeTime: Number,
    }, 
    { collection: 'orderTimeout', versionKey: false }
);

const orderTimeoutUpdate = mongoose.model('orderTimeoutUpdate', orderTimeoutSchema);

module.exports = orderTimeoutUpdate;
