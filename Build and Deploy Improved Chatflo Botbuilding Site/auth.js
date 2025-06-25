const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const inMemoryStorage = require('../storage/inMemoryStorage');

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper function to hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Helper function to compare password
const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

// User registration
router.post('/register', [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { firstName, lastName, email, password, company, role } = req.body;

    if (isMongoConnected()) {
      // Use MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      const user = new User({
        firstName,
        lastName,
        email,
        password,
        company,
        role
      });

      await user.save();

      const token = generateToken(user._id);
      const userData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        role: user.role,
        subscription: user.subscription,
        createdAt: user.createdAt
      };

      res.status(201).json({
        message: 'User registered successfully',
        user: userData,
        token
      });
    } else {
      // Use in-memory storage
      const existingUser = await inMemoryStorage.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      const hashedPassword = await hashPassword(password);
      const user = await inMemoryStorage.createUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        company,
        role
      });

      const token = generateToken(user._id);
      const userData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        role: user.role,
        subscription: user.subscription,
        createdAt: user.createdAt
      };

      res.status(201).json({
        message: 'User registered successfully (in-memory storage)',
        user: userData,
        token
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    if (isMongoConnected()) {
      // Use MongoDB
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      const userData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        role: user.role,
        subscription: user.subscription,
        usage: user.usage,
        lastLogin: user.lastLogin
      };

      res.json({
        message: 'Login successful',
        user: userData,
        token
      });
    } else {
      // Use in-memory storage
      const user = await inMemoryStorage.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      user.lastLogin = new Date();
      await inMemoryStorage.updateUser(user._id, { lastLogin: user.lastLogin });

      const token = generateToken(user._id);
      const userData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        role: user.role,
        subscription: user.subscription,
        usage: user.usage,
        lastLogin: user.lastLogin
      };

      res.json({
        message: 'Login successful (in-memory storage)',
        user: userData,
        token
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    const userData = {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      company: req.user.company,
      role: req.user.role,
      subscription: req.user.subscription,
      usage: req.user.usage,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', [
  require('../middleware/auth').authenticate,
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('company').optional().trim(),
  body('role').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { firstName, lastName, company, role } = req.body;
    const user = req.user;

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (company !== undefined) user.company = company;
    if (role) user.role = role;

    await user.save();

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      company: user.company,
      role: user.role,
      subscription: user.subscription,
      usage: user.usage
    };

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

