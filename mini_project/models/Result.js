const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    subjectCode: {
        type: String,
        required: true
    },
    subjectName: {
        type: String,
        required: true
    },
    internalMarks: {
        type: Number,
        default: 0
    },
    externalMarks: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure one student only has one result entry per subject
ResultSchema.index({ student: 1, subjectCode: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);
