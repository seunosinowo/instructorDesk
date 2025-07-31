import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { sendConfirmationEmail, sendPasswordResetEmail } from '../utils/emailService';

const router = express.Router();

// Email validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    // Validate required fields
    if (!email || !password || !role || !name) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Please provide all required fields: email, password, role, and name' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        errors: [{ msg: 'Invalid email format' }]
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Email already registered. Please log in or use a different email.' 
      });
    }

    // Generate confirmation token
    const confirmationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    
    // Normalize password before saving (it will be hashed by the model hook)
    const normalizedPassword = String(password).normalize('NFC');

    // Create user
    const newUser = await User.create({ 
      email, 
      password: normalizedPassword,
      role, 
      name, 
      confirmationToken,
      emailConfirmed: false
    });

    // Send confirmation email
    const emailSent = await sendConfirmationEmail(name, email, confirmationToken);

    if (!emailSent) {
      return res.status(201).json({ 
        status: 'warning',
        message: '✅ Account created successfully!',
        details: 'However, we could not send the confirmation email.',
        action: 'Please use the "Resend confirmation email" option or contact support.',
        email
      });
    }

    return res.status(201).json({ 
      status: 'success',
      message: 'Registration successful. Check your email for confirmation.',
      email
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials'
      });
    }

    if (!user.emailConfirmed) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Please verify your email address before logging in',
        isEmailUnconfirmed: true,
        action: 'Check your inbox for the confirmation email or use the "Resend confirmation" option',
        email
      });
    }

    // Normalize password for comparison
    const normalizedPassword = String(password).normalize('NFC');
    const isMatch = await bcrypt.compare(normalizedPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET!
    );

    return res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Email confirmation endpoint
router.post('/confirm', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };

    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) {
      return res.status(400).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    await User.update(
      { emailConfirmed: true, confirmationToken: '' },
      { where: { email: decoded.email } }
    );

    return res.json({ 
      status: 'success',
      message: 'Email confirmed successfully! You can now log in to your account.',
      email: decoded.email
    });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (user) {
      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      await User.update({ confirmationToken: resetToken }, { where: { email } });
      await sendPasswordResetEmail(email, resetToken);
    }
    
    // Always return success for security
    return res.status(200).json({ 
      message: 'If the email exists, a password reset link has been sent' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Resend confirmation email endpoint
router.post('/send-confirmation', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({ 
        message: 'If a user with that email exists, a confirmation email has been sent.' 
      });
    }

    if (user.emailConfirmed) {
      return res.status(400).json({ message: 'Email is already confirmed' });
    }

    const confirmationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    await User.update({ confirmationToken }, { where: { id: user.id } });
    await sendConfirmationEmail(user.name, email, confirmationToken);

    return res.json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Send confirmation error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Debug endpoint to check users (remove in production)
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'role', 'emailConfirmed', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    return res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Debug users error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
