const mongoose = require('mongoose');

const sshSchema = new mongoose.Schema({
    orderId: Number,
    sshLink: String,
    }, 
    { collection: 'sshLinks', versionKey: false }
);

const sshLinksUpdate = mongoose.model('sshLinks', sshSchema);

module.exports = sshLinksUpdate;