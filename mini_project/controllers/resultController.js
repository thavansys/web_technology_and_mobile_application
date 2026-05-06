const Result = require('../models/Result');
const Student = require('../models/Student');
const { calculateGrade } = require('../utils/gradeLogic');

// @route   GET /api/results/student/:rollNo
// @desc    Get results for a student (student or admin)
// @access  Private (verified via verifyStudentSelf)
const getStudentResults = async (req, res) => {
    try {
        const student = await Student.findOne({ rollNo: req.params.rollNo.toUpperCase() });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        const results = await Result.find({ student: student._id });
        
        const evaluatedResults = results.map(r => {
            const evaluation = calculateGrade(r.internalMarks, r.externalMarks);
            return {
                id: r._id,
                subjectCode: r.subjectCode,
                subjectName: r.subjectName,
                internalMarks: r.internalMarks,
                externalMarks: r.externalMarks,
                total: evaluation.total,
                grade: evaluation.grade,
                gradePoint: evaluation.gradePoint,
                isPass: evaluation.isPass
            };
        });

        res.status(200).json({
            success: true,
            data: { student, results: evaluatedResults }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   GET /api/results
// @desc    Get all results
// @access  Admin
const getAllResults = async (req, res) => {
    try {
        const results = await Result.find().populate('student', 'rollNo name semester dept');
        
        const mapped = results.map(r => ({
            id: r._id,
            student_id: r.student ? r.student._id : null,
            rollNo: r.student ? r.student.rollNo : 'Unknown',
            name: r.student ? r.student.name : 'Unknown',
            semester: r.student ? r.student.semester : '-',
            dept: r.student ? r.student.dept : 'Unknown',
            subject_code: r.subjectCode,
            subject_name: r.subjectName,
            internal_marks: r.internalMarks,
            external_marks: r.externalMarks
        }));

        res.status(200).json({ success: true, data: mapped });
    } catch (error) {

        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   POST /api/results
// @desc    Add result for a student
// @access  Admin
const addResult = async (req, res) => {
    try {
        const { rollNo, subjectCode, subjectName, internalMarks, externalMarks } = req.body;
        
        if (!rollNo || !subjectCode || !subjectName) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }

        const student = await Student.findOne({ rollNo: rollNo.toUpperCase() });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        const existing = await Result.findOne({ student: student._id, subjectCode });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Result for this subject already exists. Use PUT to update.' });
        }

        const result = await Result.create({
            student: student._id,
            subjectCode,
            subjectName,
            internalMarks: internalMarks || 0,
            externalMarks: externalMarks || 0
        });

        res.status(201).json({ success: true, message: 'Result added successfully.', data: { id: result._id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   PUT /api/results/:id
// @desc    Update a result entry
// @access  Admin
const updateResult = async (req, res) => {
    try {
        const { subjectName, internalMarks, externalMarks } = req.body;

        const result = await Result.findByIdAndUpdate(
            req.params.id,
            { subjectName, internalMarks, externalMarks },
            { new: true, runValidators: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found.' });
        }

        res.status(200).json({ success: true, message: 'Result updated successfully.', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   DELETE /api/results/:id
// @desc    Delete a result
// @access  Admin
const deleteResult = async (req, res) => {
    try {
        const result = await Result.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found.' });
        }
        res.status(200).json({ success: true, message: 'Result deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    getStudentResults,
    getAllResults,
    addResult,
    updateResult,
    deleteResult
};
