const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login/student', authController.loginStudent);
router.post('/login/admin', authController.loginAdmin);
router.post('/logout', authController.logout);

module.exports = router;
