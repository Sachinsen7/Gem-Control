const mongoose = require('mongoose');
const farmSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    removeAt: {
        type: Date,
        default: null
    }
});
module.exports = mongoose.model('Firm', farmSchema);