const mongoose = require('mongoose');

const stripeSchema = new mongoose.Schema({
    wallet: String,
    UID:Number,
    gPAmount:Number,
    link:String,
    id: String,
    completed:Boolean
    }, 
    { collection: 'stripeSchema', versionKey: false }
);

const stripeSchemaUpdate = mongoose.model('stripeSchema', stripeSchema);

module.exports = stripeSchemaUpdate;