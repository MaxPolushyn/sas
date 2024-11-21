const mongoose = require('mongoose');

// Схема для окремого питання
const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true, // Текст питання
    },
    options: [
        {
            text: {
                type: String,
                required: true, // Варіант відповіді
            },
            isCorrect: {
                type: Boolean,
                required: true, // Чи є відповідь правильною
            },
        },
    ],
});

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Назва тесту
    },
    discipline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discipline',
        required: true, // Посилання на дисципліну
    },
    questions: [questionSchema], // Масив питань
    results: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Result', // Посилання на результати тесту
        },
    ],
});

const Test = mongoose.model('Test', testSchema);
module.exports = Test;
