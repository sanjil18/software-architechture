backend / src / controllers / authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
        const token = generateToken(user._id);
        res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, badgeNumber: user.badgeNumber, district: user.district, phone: user.phone } });
    } catch (error) { next(error); }
};

const register = async (req, res, next) => {
    try {
        const { name, email, password, role, badgeNumber, phone, district } = req.body;
        const user = await User.create({ name, email, password, role: role || 'officer', badgeNumber, phone, district });
        res.status(201).json({ success: true, message: 'User created successfully.', user: { id: user._id, name: user.name, email: user.email, role: user.role, badgeNumber: user.badgeNumber, district: user.district } });
    } catch (error) { next(error); }
};

const getMe = async (req, res) => res.status(200).json({ success: true, user: req.user });

module.exports = { login, register, getMe };