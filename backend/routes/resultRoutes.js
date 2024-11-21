const express = require('express');
const router = express.Router();
const Result = require('../models/Result'); // Import the Result schema
const authenticate = require('../middleware/authMiddleware'); // Middleware for authentication

router.post('/save', async (req, res) => {
    const { student, test, score, discipline } = req.body;

    console.log('Request to save result:', req.body);

    if (!student || !test || !score || !discipline) {
        console.error('Validation failed: Missing required fields');
        return res.status(400).json({ message: 'All fields are required: student, test, score, discipline.' });
    }

    try {
        // Create a new result object
        const result = new Result({
            student,
            test,
            score,
            discipline,
        });

        console.log('Prepared result object for saving:', result);

        // Save to the database
        const savedResult = await result.save();
        console.log('Result saved successfully:', savedResult);

        res.status(201).json({ message: 'Result saved successfully', result: savedResult });
    } catch (error) {
        console.error('Error saving result:', error);
        res.status(500).json({ message: 'Error saving result', error: error.message });
    }
});
router.get('/show/:studentId', async (req, res) => {
    const { studentId } = req.params;

    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required.' });
    }

    try {
        const results = await Result.find({ student: studentId })
            .populate('test', 'name') // Populate test name
            .populate('discipline', 'name') // Populate discipline name
            .exec();

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ message: 'Failed to fetch results', error: error.message });
    }
});


module.exports = router;
