const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    logTime: {
        type: String,
        default: Date.now
    },
    logMessage: {
        type: String,
        required: false
    },
});

const Log = mongoose.model('Log', LogSchema);
module.exports = Log;