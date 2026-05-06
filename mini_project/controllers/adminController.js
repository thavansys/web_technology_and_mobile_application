const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Result = require('../models/Result');
const { calculateGrade, calculateCGPA } = require('../utils/gradeLogic');

// @route   GET /api/admin/dashboard
// @desc    Stats: total students, pass%, avg CGPA, results count
// @access  Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const results = await Result.find().populate('student', 'dept');

        const studentResults = {};
        const studentDeptMap = {};
        results.forEach(r => {
            const sid = r.student._id.toString();
            if (!studentResults[sid]) studentResults[sid] = [];
            const evaluation = calculateGrade(r.internalMarks, r.externalMarks);
            studentResults[sid].push(evaluation);
            studentDeptMap[sid] = r.student.dept;
        });

        let passCount = 0;
        let cgpaSum = 0;
        const totalPublishedStudents = Object.keys(studentResults).length;

        // Department-wise accumulators
        const deptStats = {};

        for (const studentId in studentResults) {
            const marksArray = studentResults[studentId];
            const passedAll = marksArray.every(m => m.isPass);
            if (passedAll) passCount++;

            const cgpa = parseFloat(calculateCGPA(marksArray));
            cgpaSum += cgpa;

            // Department-wise tracking
            const dept = studentDeptMap[studentId] || 'Other';
            if (!deptStats[dept]) {
                deptStats[dept] = { totalStudents: 0, publishedStudents: 0, passCount: 0, cgpaSum: 0 };
            }
            deptStats[dept].publishedStudents++;
            if (passedAll) deptStats[dept].passCount++;
            deptStats[dept].cgpaSum += cgpa;
        }

        // Count total students per department (including those without results)
        const allStudents = await Student.find({}, 'dept');
        allStudents.forEach(s => {
            const dept = s.dept || 'Other';
            if (!deptStats[dept]) {
                deptStats[dept] = { totalStudents: 0, publishedStudents: 0, passCount: 0, cgpaSum: 0 };
            }
            deptStats[dept].totalStudents++;
        });

        // Build department-wise summary
        const departmentWise = Object.keys(deptStats).sort().map(dept => {
            const d = deptStats[dept];
            return {
                department: dept,
                totalStudents: d.totalStudents,
                publishedStudents: d.publishedStudents,
                passPercentage: d.publishedStudents > 0 ? ((d.passCount / d.publishedStudents) * 100).toFixed(2) : '0.00',
                avgCGPA: d.publishedStudents > 0 ? (d.cgpaSum / d.publishedStudents).toFixed(2) : '0.00'
            };
        });

        const passPercentage = totalPublishedStudents > 0 ? ((passCount / totalPublishedStudents) * 100).toFixed(2) : 0;
        const avgCGPA = totalPublishedStudents > 0 ? (cgpaSum / totalPublishedStudents).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalPublishedStudents,
                passPercentage,
                avgCGPA,
                departmentWise
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   GET /api/admin/admins
// @desc    List all admins
// @access  Admin
const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.status(200).json({ success: true, data: admins });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @route   POST /api/admin/admins
// @desc    Add new admin
// @access  Admin
const createAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required.' });
        }

        const existing = await Admin.findOne({ username });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Username already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await Admin.create({ username, password: hashedPassword });

        res.status(201).json({ success: true, message: 'Admin created successfully.', data: { id: admin._id, username: admin.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAdmins,
    createAdmin
};
