const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: Number,
    machineId: Number,
    providerId: String,
    renterId: Number,
    renterUsername: String,
    gPointsPaid: Number,
    hoursRented: Number,
    },
    { collection: 'Order', versionKey: false }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
