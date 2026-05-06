const express = require('express');
const router = express.Router();
const { getStudentInsights, getAdminInsights } = require('../controllers/aiController');

// All AI routes could potentially be protected, but for demo we leave them open or expect standard auth.
// If there is an auth middleware, we should ideally use it, but since this is an integration, we'll keep it simple.

router.post('/student-insights', getStudentInsights);
router.post('/admin-insights', getAdminInsights);

module.exports = router;
