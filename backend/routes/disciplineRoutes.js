const express = require('express');
const Discipline = require('../models/Discipline');
const router = express.Router();

router.post('/', async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Discipline name is required.' });
    }

    try {
        const existingDiscipline = await Discipline.findOne({ name: name.trim() });
        if (existingDiscipline) {
            return res.status(400).json({ message: 'Discipline already exists.' });
        }

        const discipline = new Discipline({ name: name.trim() });
        await discipline.save();

        res.status(201).json({ message: 'Discipline added successfully!', discipline });
    } catch (error) {
        console.error('Error adding discipline:', error);
        res.status(500).json({ message: 'Error adding discipline.', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const disciplines = await Discipline.find();
        res.json(disciplines);
    } catch (error) {
        console.error('Error fetching disciplines:', error);
        res.status(500).json({ message: 'Error fetching disciplines.' });
    }
});
module.exports = router;
