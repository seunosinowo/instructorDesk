import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
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
    const { email, password, role, name, bio } = req.body;

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
      bio,
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
    const { email, password, rememberMe = false } = req.body;

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

    // Generate long-lasting tokens (always remember user)
    const accessTokenExpiry = '30d'; // 30 days for all logins
    
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, type: 'access' }, 
      process.env.JWT_SECRET!,
      { expiresIn: accessTokenExpiry }
    );

    // Always create refresh token for extended sessions
    const refreshTokenExpiry = '90d'; // 90 days refresh token
    
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: refreshTokenExpiry }
    );

    // Store refresh token in database
    const refreshTokenExpiryDate = new Date();
    refreshTokenExpiryDate.setDate(refreshTokenExpiryDate.getDate() + 90);

    await User.update(
      { 
        refreshToken,
        refreshTokenExpiry: refreshTokenExpiryDate
      },
      { where: { id: user.id } }
    );

    const response = { 
      token: accessToken,
      refreshToken,
      expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        profileCompleted: user.profileCompleted
      }
    };

    return res.json(response);
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

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'Refresh token required' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string, type: string };

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        error: 'Invalid token type' 
      });
    }

    // Find user and check if refresh token matches and is not expired
    const user = await User.findOne({ 
      where: { 
        id: decoded.id,
        refreshToken,
        refreshTokenExpiry: {
          [Op.gt]: new Date()
        }
      } 
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid or expired refresh token' 
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role, type: 'access' }, 
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return res.json({ 
      token: newAccessToken,
      expiresIn: 60 * 60 // 1 hour in seconds
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { userId, refreshToken } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID required' 
      });
    }

    // Clear refresh token from database
    await User.update(
      { 
        refreshToken: undefined,
        refreshTokenExpiry: undefined
      },
      { where: { id: userId } }
    );

    return res.json({ 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Debug endpoint to check users (remove in production)
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'role', 'bio', 'emailConfirmed', 'profileCompleted', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    return res.json({
      count: users.length,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        bio: u.bio,
        emailConfirmed: u.emailConfirmed,
        profileCompleted: u.profileCompleted,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug users error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Change password endpoint
router.put('/change-password', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const normalizedCurrentPassword = String(currentPassword).normalize('NFC');
    const isMatch = await bcrypt.compare(normalizedCurrentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const normalizedNewPassword = String(newPassword).normalize('NFC');
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(normalizedNewPassword, saltRounds);

    // Update password
    await User.update(
      { password: hashedNewPassword },
      { where: { id: user.id } }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
