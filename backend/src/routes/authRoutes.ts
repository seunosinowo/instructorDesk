import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { User } from '../models/user.model';
import { Op } from 'sequelize';
import { readFile } from 'fs/promises';
import { guestMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

router.post('/register', guestMiddleware, async (req, res) => {
  const { email, password, role, name, bio } = req.body;
  try {
    if (!validateEmail(email)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid email format' }] });
    }

    // Check for existing user by email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please log in or use a different email.' });
    }

    const confirmationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    await User.create({ email, password, role, name, bio, confirmationToken });

    const url = `${process.env.FRONTEND_URL}/confirm?token=${confirmationToken}`;
    // Read and customize email template
    const template = await readFile('emailTemplate.html', 'utf-8');
    const html = template
      .replace('[Name]', name)
      .replace('[ConfirmationLink]', url);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm your email',
      html,
    });

    res.status(201).json({ message: 'Registration successful. Check your email for confirmation.' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', guestMiddleware, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.emailConfirmed) {
      return res.status(401).json({ error: 'Please confirm your email before logging in' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name, bio: user.bio, profileCompleted: user.profileCompleted } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/confirm', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    const user = await User.findOne({ where: { email: decoded.email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailConfirmed) {
      return res.status(400).json({ message: 'Email already confirmed' });
    }

    await User.update({ emailConfirmed: true, confirmationToken: '' }, { where: { email: decoded.email } });
    res.json({ message: 'Email confirmed successfully' });
  } catch (error) {
    console.error('Confirmation error:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

router.get('/confirm', async (req, res, next) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { id?: string, email?: string };
    if (decoded.id) {
      await User.update({ emailConfirmed: true }, { where: { id: decoded.id } });
      // Redirect to frontend confirmation page
      return res.redirect(`${process.env.FRONTEND_URL}/confirm`);
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

router.post('/send-confirmation', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const confirmationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    await User.update({ confirmationToken }, { where: { id: user.id } });
    const url = `${process.env.FRONTEND_URL}/confirm?token=${confirmationToken}`;
    // Read and customize email template
    const template = await readFile('emailTemplate.html', 'utf-8');
    const html = template
      .replace('[Name]', user.name || 'User')
      .replace('[ConfirmationLink]', url);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm your email',
      html,
    });

    res.json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', guestMiddleware, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    await User.update({ confirmationToken: resetToken }, { where: { id: user.id } });
    
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    // Create password reset email template
    const resetTemplate = await readFile('passwordResetTemplate.html', 'utf-8');
    const html = resetTemplate
      .replace('[Name]', user.name || 'User')
      .replace('[ConfirmationLink]', url);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your password',
      html,
    });

    res.json({ message: 'If the email exists, a password reset link has been sent' });
  } catch (error) {
    console.error('Password reset email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', guestMiddleware, async (req, res) => {
  const { token, password } = req.body;
  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    const user = await User.findOne({ where: { email: decoded.email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.confirmationToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    await User.update({ 
      password: password, 
      confirmationToken: '' 
    }, { where: { id: user.id } });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

router.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

//To delete a user
router.delete('/user/:id', async (req, res) => {
  const { id } = req.params;
  const deleted = await User.destroy({ where: { id } });
  if (deleted) {
    return res.json({ message: 'User deleted successfully.' });
  } else {
    return res.status(404).json({ message: 'User not found.' });
  }
});

export default router;