const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// @route   POST /api/auth/login/student
// @desc    Student login with rollNo & dob
const loginStudent = async (req, res) => {
    try {
        const { rollNo, dob } = req.body;
        if (!rollNo || !dob) {
            return res.status(400).json({ success: false, message: 'Roll number and Date of Birth are required.' });
        }

        const student = await Student.findOne({ rollNo: rollNo.toUpperCase(), dob });
        if (!student) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: student._id, rollNo: student.rollNo, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            success: true,
            data: {
                token,
                user: { id: student._id, rollNo: student.rollNo, name: student.name, role: 'student' }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   POST /api/auth/login/admin
// @desc    Admin login with username & password
const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required.' });
        }

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            success: true,
            data: {
                token,
                user: { id: admin._id, username: admin.username, role: 'admin' }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   POST /api/auth/logout
// @desc    Invalidate token
const logout = (req, res) => {
    res.status(200).json({ success: true, message: 'Successfully logged out.' });
};

module.exports = {
    loginStudent,
    loginAdmin,
    logout
};
