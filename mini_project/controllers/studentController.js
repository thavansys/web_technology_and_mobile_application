const Student = require('../models/Student');
const Result = require('../models/Result');

// @route   GET /api/students
// @desc    Get all students (with search ?name= &dept= &semester=)
// @access  Admin 
const getStudents = async (req, res) => {
    try {
        const { name, dept, semester } = req.query;
        let filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        if (dept) {
            filter.dept = dept;
        }
        if (semester) {
            filter.semester = semester;
        }

        const students = await Student.find(filter);
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   GET /api/students/:id
// @desc    Get single student by ID
// @access  Admin
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   POST /api/students
// @desc    Add new student
// @access  Admin
const createStudent = async (req, res) => {
    try {
        const { rollNo, name, dob, dept, semester, year } = req.body;
        if (!rollNo || !name) {
            return res.status(400).json({ success: false, message: 'Roll Number and Name are required.' });
        }

        const existing = await Student.findOne({ rollNo: rollNo.toUpperCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Student with this roll number already exists.' });
        }

        const student = await Student.create({
            rollNo: rollNo.toUpperCase(),
            name, dob, dept, semester, year
        });

        res.status(201).json({ 
            success: true, 
            message: 'Student added successfully!',
            data: student
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   PUT /api/students/:id
// @desc    Update student details
// @access  Admin
const updateStudent = async (req, res) => {
    try {
        const { name, dob, dept, semester, year } = req.body;
        
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { name, dob, dept, semester, year },
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        res.status(200).json({ success: true, message: 'Student updated successfully.', data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Admin
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        // Cascade delete results
        await Result.deleteMany({ student: req.params.id });
        
        res.status(200).json({ success: true, message: 'Student deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};
