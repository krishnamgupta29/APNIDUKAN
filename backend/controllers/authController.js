const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token (Login for Admin and Delivery)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Register a new user (Delivery Boy)
// @route   POST /api/auth/register-delivery
// @access  Private/Admin
const registerDeliveryUser = async (req, res) => {
    const { name, username, password, contact } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            username,
            passwordHash,
            role: 'delivery',
            contact
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get all delivery users
// @route   GET /api/auth/delivery-users
// @access  Private/Admin
const getDeliveryUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'delivery' }).select('-passwordHash');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Delete delivery user
// @route   DELETE /api/auth/delivery-users/:id
// @access  Private/Admin
const deleteDeliveryUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user && user.role === 'delivery') {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ error: 'User not found or not a delivery boy' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    loginUser,
    registerDeliveryUser,
    getDeliveryUsers,
    deleteDeliveryUser
};
