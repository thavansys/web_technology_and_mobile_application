const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { verifyToken, isAdmin, verifyStudentSelf } = require('../middleware/auth');

// All result routes require authentication
router.use(verifyToken);

// Accessible by admin or the specific student
router.get('/student/:rollNo', verifyStudentSelf, resultController.getStudentResults);

// Admin only routes
router.get('/', isAdmin, resultController.getAllResults);
router.post('/', isAdmin, resultController.addResult);
router.put('/:id', isAdmin, resultController.updateResult);
router.delete('/:id', isAdmin, resultController.deleteResult);

module.exports = router;
