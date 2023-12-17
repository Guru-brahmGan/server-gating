const mongoose = require('mongoose');

const sshSchema = new mongoose.Schema({
    orderId: Number,
    sshLink: String,
    ipAddress: String,
    user: String,
    }, 
    { collection: 'sshLinks', versionKey: false }
);

const sshLinksUpdate = mongoose.model('sshLinks', sshSchema);

module.exports = sshLinksUpdate;