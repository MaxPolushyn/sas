// models/Discipline.js
const mongoose = require('mongoose');

const disciplineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, 
    },
    tests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test', 
    }],
});

const Discipline = mongoose.model('Discipline', disciplineSchema);
module.exports = Discipline;
