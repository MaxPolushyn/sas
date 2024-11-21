const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);

router.get('/student-home', (req, res) => {
    const studentId = req.query.userId; 
    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    res.status(200).json({
        message: `Welcome, student with ID: ${studentId}`,
        studentId,
    });
});

module.exports = router;
