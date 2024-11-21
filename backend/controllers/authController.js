const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
require('dotenv').config();

exports.registerUser = async (req, res) => {
    const { email, firstName, lastName, password, role } = req.body;

    try {
        if (role === 'Admin' && await Admin.findOne({ email })) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }
        if (role === 'Student' && await Student.findOne({ email })) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }
        if (role === 'Teacher' && await Teacher.findOne({ email })) {
            return res.status(400).json({ message: 'Teacher with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'Admin') {
            const admin = new Admin({ email, firstName, lastName, password: hashedPassword });
            await admin.save();
        } else if (role === 'Student') {
            const student = new Student({ email, firstName, lastName, password: hashedPassword });
            await student.save();
        } else if (role === 'Teacher') {
            const teacher = new Teacher({ email, firstName, lastName, password: hashedPassword });
            await teacher.save();
        }

        res.status(201).json({ 
            message: 'User registered successfully', 
            redirectUrl: '/pages/login.html' 
        });
    } catch (error) {
        console.error('Error while registering user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        if (!email || !password || !role) {
            console.error('Login failed: Missing fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        let user;
        if (role === 'Student') {
            user = await Student.findOne({ email });
        } else if (role === 'Teacher') {
            user = await Teacher.findOne({ email });
        } else if (role === 'Admin') {
            user = await Admin.findOne({ email });
        } else {
            console.error(`Login failed: Invalid role ${role}`);
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        if (!user) {
            console.error(`Login failed: User not found (${email})`);
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.error(`Login failed: Invalid password for user (${email})`);
            return res.status(401).json({ message: 'Invalid password' });
        }

        console.log('Login successful:', { email, role });

        res.status(200).json({
            message: 'Login successful',
            userId: user._id,
            role: role,
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



