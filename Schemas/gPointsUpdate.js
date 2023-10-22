const mongoose = require('mongoose');

const gPointsUpdateSchema = new mongoose.Schema({
    user: String,
    amount: Number,
    orderType: Number
    }, 
    { collection: 'gPointsUpdateEvents', versionKey: false }
);

const gPointsUpdate = mongoose.model('gPointsUpdate', gPointsUpdateSchema);

module.exports = gPointsUpdate;
