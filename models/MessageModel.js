const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    author: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
}, { timestamps: true });


module.exports = mongoose.model('Message', MessageSchema);