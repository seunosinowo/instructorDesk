import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { User } from '../models/user.model';
import { Op } from 'sequelize';

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

router.post('/register', async (req, res) => {
  const { email, password, role, name, bio } = req.body;
  try {
    if (!validateEmail(email)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid email format' }] });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const confirmationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    await User.create({ email, password: await bcrypt.hash(password, 10), role, name, bio, confirmationToken });

    const url = `http://localhost:3000/confirm?token=${confirmationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm your email',
      html: `Click <a href="${url}">here</a> to confirm your email.`
    });

    res.status(201).json({ message: 'Registration successful. Check your email for confirmation.' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.emailConfirmed) return res.status(401).json({ message: 'Invalid credentials or unconfirmed email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name, bio: user.bio, profileCompleted: user.profileCompleted } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/confirm', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    await User.update({ emailConfirmed: true, confirmationToken: '' }, { where: { email: decoded.email } });
    res.json({ message: 'Email confirmed' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

router.post('/send-confirmation', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const confirmationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    await User.update({ confirmationToken }, { where: { id: user.id } });

    const url = `http://localhost:3000/confirm?token=${confirmationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm your email',
      html: `Click <a href="${url}">here</a> to confirm your email.`
    });

    res.json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;