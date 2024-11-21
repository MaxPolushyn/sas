const router = require('express').Router();
const Test = require('../models/Test');
const Discipline = require('../models/Discipline');
const Result = require('../models/Result');
const authenticate = require('../middleware/authMiddleware');

router.post('/creates', async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString(); 
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            console.log('Parsed body:', parsedBody);

            const { name, discipline, questions } = parsedBody;

            if (!name || !discipline || !questions || questions.length === 0) {
                console.error('Invalid input for creating test:', { name, discipline, questions });
                return res.status(400).json({
                    message: 'Invalid input: Name, discipline, and at least one question are required.',
                });
            }

            const disciplineRecord = await Discipline.findById(discipline);
            if (!disciplineRecord) {
                console.warn('Discipline not found for ID:', discipline);
                return res.status(404).json({ message: 'Discipline not found' });
            }

            const test = new Test({
                name,
                discipline: disciplineRecord._id,
                questions,
            });

            await test.save();
            disciplineRecord.tests.push(test._id);
            await disciplineRecord.save();

            res.status(201).json({ message: 'Test created successfully', test });
        } catch (error) {
            console.error('Error processing the request:', error.message);
            res.status(500).json({ message: 'Error processing the request', error: error.message });
        }
    });
});

router.get('/ping', async (req, res) => {
    const disciplineId = req.query.discipline;
    console.log('Received request to fetch tests for discipline ID:', disciplineId);

    if (!disciplineId) {
        console.error('Discipline ID not provided in request.');
        return res.status(400).json({ message: 'Discipline ID is required.' });
    }

    try {
        console.log('Checking database for discipline:', disciplineId);
        const discipline = await Discipline.findById(disciplineId);
        if (!discipline) {
            console.warn('Discipline not found:', disciplineId);
            return res.status(404).json({ message: 'Discipline not found.' });
        }

        console.log('Fetching tests for discipline:', discipline.name);
        const tests = await Test.find({ discipline: disciplineId }).populate('discipline', 'name');

        if (!tests || tests.length === 0) {
            console.warn('No tests found for discipline ID:', disciplineId);
            return res.status(404).json({ message: 'No tests found for this discipline.' });
        }

        console.log('Fetched tests successfully:', tests);
        res.status(200).json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ message: 'Error fetching tests', error: error.message });
    }
});

router.get('/ping/:testId', async (req, res) => {
    const { testId } = req.params;
    console.log('Received request to fetch test with ID:', testId);

    if (!testId) {
        console.error('Test ID not provided in request.');
        return res.status(400).json({ message: 'Test ID is required.' });
    }

    try {
        console.log('Fetching test for ID:', testId);
        const test = await Test.findById(testId).populate('discipline', 'name');

        if (!test) {
            console.warn('Test not found for ID:', testId);
            return res.status(404).json({ message: 'Test not found' });
        }

        console.log('Fetched test:', test);
        res.status(200).json(test);
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).json({ message: 'Error fetching test', error: error.message });
    }
});

router.post('/ping/:testId/submit', authenticate, async (req, res) => {
    const { testId } = req.params;
    const { answers } = req.body;

    console.log('Route triggered: /ping/:testId/submit');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);

    if (!req.user || !req.user.studentId) {
        console.error('Authentication failed or student ID missing in request.');
        return res.status(403).json({ message: 'Authentication required.' });
    }

    const studentId = req.user.studentId;
    console.log('Authenticated user:', req.user);
    console.log('Submitting test for student ID:', studentId, 'Test ID:', testId);

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        console.error('Invalid answers provided:', answers);
        return res.status(400).json({ message: 'Answers are required for test submission.' });
    }

    try {
        console.log('Fetching test data for ID:', testId);
        const test = await Test.findById(testId);
        console.log('Fetched test:', test);

        if (!test) {
            console.warn('Test not found for ID:', testId);
            return res.status(404).json({ message: 'Test not found' });
        }

        console.log('Calculating score for test:', test.name);
        let score = 0;

        if (!test.questions || !Array.isArray(test.questions)) {
            console.error('Invalid test questions format:', test.questions);
            return res.status(500).json({ message: 'Invalid test questions format.' });
        }

        test.questions.forEach((question, index) => {
            console.log(`Checking question ${index}:`, question.text);

            const correctOption = question.options.find(option => option.isCorrect);
            console.log('Correct option:', correctOption);

            const studentAnswer = answers.find(answer => answer.question === `${index}`);
            console.log('Student answer:', studentAnswer);

            if (studentAnswer?.answer === correctOption?.text) {
                console.log(`Answer is correct for question ${index}`);
                score += 1;
            } else {
                console.log(`Answer is incorrect for question ${index}`);
            }
        });

        console.log('Score calculated:', score);

        const totalQuestions = test.questions.length;
        const grade = calculateGrade(score, totalQuestions);
        console.log('Grade calculated:', grade);

        const result = new Result({
            student: studentId,
            test: testId,
            score,
            grade,
            completedAt: new Date(),
        });

        console.log('Result object being saved:', result);
        await result.save();
        console.log('Test result saved successfully:', result);

        res.status(200).json({ message: 'Test submitted successfully', score, grade });
    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ message: 'Error submitting test', error: error.message });
    }
});

const calculateGrade = (score, totalQuestions) => {
    const percentage = (score / totalQuestions) * 100;
    console.log('Calculating grade from percentage:', percentage);

    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
};





module.exports = router;
