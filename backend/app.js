const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const disciplineRoutes = require('./routes/disciplineRoutes');
const resultRoutes = require('./routes/resultRoutes');
const app = express();
const testRoutes = require('./routes/testRoutes');
app.use('/api/tests', testRoutes);
const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
app.use(express.json());

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('Registering routes...');
app.use('/api/auth', authRoutes);
const backendPath = path.join(__dirname, '../backend');
app.use(express.static(backendPath));

app.use(express.static(frontendPath));
app.use('/api/disciplines', disciplineRoutes);
app.use('/api/results', resultRoutes);
app.use('/pages', express.static(path.join(frontendPath, 'pages')));
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'pages/register.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(frontendPath, 'pages/register.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'pages/login.html'));
});
app.get('/logout', (req, res) => {
    res.sendFile(path.join(frontendPath, 'pages/login.html'));
});
app.get('/teacher-home.html', (req, res) => {
    res.sendFile(path.join(frontendPath, 'pages/teacher-home.html'));
});
app.get('/student-home.html', (req, res) => {
    const studentId = req.query.studentId;
    if (!studentId) {
        console.error('Access denied: Missing student ID.');
        return res.status(400).send('<h1>Access Denied: Student ID is required.</h1><a href="/login">Go to Login</a>');
    }
    console.log(`Accessing student home page for student ID: ${studentId}`);
    res.sendFile(path.join(frontendPath, 'pages/student-home.html'));
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
});

require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://zmeya320:WyrzFzMKShoCx463@cluster0.juqwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); 
    }
};

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
