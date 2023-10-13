const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: Number,
    machineId: Number,
    providerId: String,
    renterId: String,
    renterUsername: String,
    gPointsPaid: Number,
    hoursRented: Number,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
