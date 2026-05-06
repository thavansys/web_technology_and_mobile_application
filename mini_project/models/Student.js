const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    rollNo: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true
    },
    dob: {
        type: String, // Storing as YYYY-MM-DD
        required: true
    },
    dept: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
