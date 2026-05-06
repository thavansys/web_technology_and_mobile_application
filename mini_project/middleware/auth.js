const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify standard JWT token
const verifyToken = (req, res, next) => {
    let token = req.headers.authorization;
    
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        token = token.split(' ')[1]; // Extract token from "Bearer <token>"
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id, role, (and rollNo if student)
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
};

// Middleware to restrict access to Admins only
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }
};

// Middleware to ensure a student only accesses their own data
const verifyStudentSelf = (req, res, next) => {
    // Determine the requested rollNo from URL params or body
    const requestedRollNo = req.params.rollNo || req.body.rollNo || req.query.rollNo;
    
    if (req.user.role === 'admin') {
        // Admins can see any student's data
        return next();
    }
    
    if (req.user.role === 'student' && req.user.rollNo === requestedRollNo) {
        // Students can only see their own
        return next();
    }

    return res.status(403).json({ success: false, message: 'Forbidden. Cannot access another student\'s data.' });
};

module.exports = {
    verifyToken,
    isAdmin,
    verifyStudentSelf
};
