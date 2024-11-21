const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

const authenticate = (requiredRole) => async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log('Received token:', token);

    if (!token) {
        return res.status(403).json({ message: 'Access Denied: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        let user;
        if (decoded.role === 'Student') {
            user = await Student.findById(decoded.id);
        } else if (decoded.role === 'Teacher') {
            user = await Teacher.findById(decoded.id);
        } else if (decoded.role === 'Admin') {
            user = await Admin.findById(decoded.id);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (requiredRole && decoded.role !== requiredRole) {
            return res.status(403).json({ message: 'Access Denied: Insufficient permissions' });
        }

        req.userDetails = user;
        next();
    } catch (error) {
        console.error('Token validation error:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticate;
