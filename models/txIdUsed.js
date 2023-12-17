const mongoose = require('mongoose');

const txIdSchema = new mongoose.Schema({
    txId: String,
    }, 
    { collection: 'txIds', versionKey: false }
);

const txIdUpdate = mongoose.model('txIds', txIdSchema);

module.exports = txIdUpdate;