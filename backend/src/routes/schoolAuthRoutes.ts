import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User, School } from '../models';
import { sendConfirmationEmail } from '../utils/emailService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Validate environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Email validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// School registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both email and password',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long',
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      let userTypeMessage = '';
      switch (existingUser.role) {
        case 'teacher':
          userTypeMessage = 'This email is already registered as a teacher account.';
          break;
        case 'student':
          userTypeMessage = 'This email is already registered as a student account.';
          break;
        case 'school':
          userTypeMessage = 'This email is already registered as a school account. Please use the school login or contact support.';
          break;
        default:
          userTypeMessage = 'This email is already registered.';
      }

      return res.status(400).json({
        status: 'error',
        message: `${userTypeMessage} Each email can only be used for one account type. Please use a different email or contact support if you need to change your account type.`,
        existingUserType: existingUser.role,
      });
    }

    // Generate confirmation token
    const confirmationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' });

    // Normalize password before saving (it will be hashed by the model hook)
    const normalizedPassword = String(password).normalize('NFC');

    // Create user with school role
    const newUser = await User.create({
      email,
      password: normalizedPassword,
      role: 'school',
      name: 'School Account', // Temporary name, will be updated during profile completion
      confirmationToken,
      emailConfirmed: false,
    });

    // Send confirmation email
    const emailSent = await sendConfirmationEmail('School Administrator', email, confirmationToken);

    if (!emailSent) {
      return res.status(201).json({
        status: 'warning',
        message: 'Account created successfully!',
        details: 'However, we could not send the confirmation email.',
        action: 'Please use the "Resend confirmation email" option or contact support.',
        email,
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Registration successful. Check your email for confirmation.',
      email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Resend confirmation email endpoint
router.post('/resend-confirmation', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ where: { email, role: 'school' } });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No school account found with this email',
      });
    }

    if (user.emailConfirmed) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already confirmed. Please login.',
      });
    }

    const confirmationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' });

    await User.update(
      { confirmationToken },
      { where: { email } }
    );

    const emailSent = await sendConfirmationEmail('School Administrator', email, confirmationToken);

    if (!emailSent) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send confirmation email. Please try again or contact support.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Confirmation email resent successfully. Check your email.',
      email,
    });
  } catch (error) {
    console.error('Resend confirmation error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// School login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Check if user is a school
    if (user.role !== 'school') {
      return res.status(401).json({
        status: 'error',
        message: 'This login is for schools only',
      });
    }

    if (!user.emailConfirmed) {
      return res.status(401).json({
        status: 'error',
        message: 'Please verify your email address before logging in',
        isEmailUnconfirmed: true,
        action: 'Check your inbox for the confirmation email or use the "Resend confirmation" option',
        email,
      });
    }

    // Normalize password for comparison
    const normalizedPassword = String(password).normalize('NFC');
    const isMatch = await bcrypt.compare(normalizedPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Generate long-lasting tokens
    const accessTokenExpiry = '30d';

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: accessTokenExpiry }
    );

    // Always create refresh token for extended sessions
    const refreshTokenExpiry = '90d';

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
        refreshTokenExpiry: refreshTokenExpiryDate,
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
        profileCompleted: user.profileCompleted,
      },
    };

    return res.json(response);
  } catch (error) {
    console.error('School login error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// School profile completion endpoint
router.put('/complete-profile/:userId', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const { userId } = req.params;

    // Validate userId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid user ID format' });
    }

    // Check if user is authorized
    if (req.user!.id !== userId || req.user!.role !== 'school') {
      return res.status(403).json({ status: 'error', message: 'Not authorized to update this school profile' });
    }

    const {
      schoolName,
      address,
      city,
      state,
      country,
      phoneNumber,
      website,
      schoolType,
      gradeLevels,
      accreditation,
      studentCount,
      teacherCount,
      establishedYear,
      description,
      facilities,
      extracurricularActivities,
      socialLinks,
      profilePictureUrl,
    } = req.body;

    // Debug logging for all received data
    console.log('Received profile data:', {
      schoolName,
      address,
      city,
      state,
      country,
      phoneNumber,
      website,
      schoolType,
      gradeLevels,
      accreditation,
      studentCount,
      teacherCount,
      establishedYear,
      description,
      facilities,
      extracurricularActivities,
      socialLinks,
      profilePictureUrl
    });

    // Debug logging for accreditation field
    console.log('Accreditation received:', accreditation, 'Type:', typeof accreditation);

    // Find or create school record
    console.log('Looking for school with userId:', userId);
    let school = await School.findOne({ where: { userId: userId } });
    console.log('School found:', school ? 'Yes' : 'No');

    if (!school) {
      console.log('Creating new school record for userId:', userId);
      try {
        school = await School.create({
          userId: userId,
          schoolName: '',
          address: '',
          city: '',
          state: '',
          country: '',
          schoolType: 'public',
          gradeLevels: [],
        });
        console.log('School created successfully with ID:', school.id);
      } catch (createError: any) {
        console.error('Error creating school record:', createError);
        throw new Error(`Failed to create school record: ${createError.message}`);
      }
    }

    // Validate and prepare data for update
    const updateData: any = {};

    // Required string fields
    if (schoolName && typeof schoolName === 'string') updateData.schoolName = schoolName.trim();
    if (address && typeof address === 'string') updateData.address = address.trim();
    if (city && typeof city === 'string') updateData.city = city.trim();
    if (state && typeof state === 'string') updateData.state = state.trim();
    if (country && typeof country === 'string') updateData.country = country.trim();

    // Optional string fields
    if (phoneNumber && typeof phoneNumber === 'string') updateData.phoneNumber = phoneNumber.trim();
    if (website && typeof website === 'string') updateData.website = website.trim();
    if (description && typeof description === 'string') updateData.description = description.trim();

    // School type validation
    if (schoolType && ['public', 'private', 'charter', 'international'].includes(schoolType)) {
      updateData.schoolType = schoolType;
    }

    // Array fields validation
    if (Array.isArray(gradeLevels)) updateData.gradeLevels = gradeLevels;
    if (Array.isArray(facilities)) updateData.facilities = facilities;
    if (Array.isArray(extracurricularActivities)) updateData.extracurricularActivities = extracurricularActivities;

    // Numeric fields validation with proper type conversion
    if (studentCount !== undefined && studentCount !== null && studentCount !== '') {
      const numStudentCount = typeof studentCount === 'number' ? studentCount : parseInt(String(studentCount));
      if (!isNaN(numStudentCount) && numStudentCount >= 0) {
        updateData.studentCount = numStudentCount;
      }
    }

    if (teacherCount !== undefined && teacherCount !== null && teacherCount !== '') {
      const numTeacherCount = typeof teacherCount === 'number' ? teacherCount : parseInt(String(teacherCount));
      if (!isNaN(numTeacherCount) && numTeacherCount >= 0) {
        updateData.teacherCount = numTeacherCount;
      }
    }

    if (establishedYear !== undefined && establishedYear !== null && establishedYear !== '') {
      const numEstablishedYear = typeof establishedYear === 'number' ? establishedYear : parseInt(String(establishedYear));
      if (!isNaN(numEstablishedYear) && numEstablishedYear >= 1800 && numEstablishedYear <= new Date().getFullYear()) {
        updateData.establishedYear = numEstablishedYear;
      }
    }

    // Social links validation
    if (socialLinks && typeof socialLinks === 'object') updateData.socialLinks = socialLinks;

    // Handle accreditations field with special validation
    if (accreditation !== undefined && accreditation !== null) {
      if (typeof accreditation === 'string' && accreditation.trim() !== '') {
        updateData.accreditations = accreditation.trim();
      } else if (typeof accreditation === 'string' && accreditation.trim() === '') {
        // Don't include empty strings
      } else {
        console.warn('Invalid accreditation type:', typeof accreditation, accreditation);
      }
    }

    // Debug logging for update data
    console.log('Update data being sent to database:', updateData);

    // Update school profile with all fields
    try {
      console.log('Attempting to update school with data:', updateData);
      await school.update(updateData);
      console.log('School update successful');
    } catch (updateError: any) {
      console.error('School update error details:', updateError);
      console.error('Update data that caused error:', updateData);
      throw new Error(`Failed to update school profile: ${updateError.message}`);
    }

    // Update user profile picture and name if provided
    const userUpdateData: any = {};
    if (profilePictureUrl) {
      userUpdateData.profilePicture = profilePictureUrl;
    }
    if (schoolName && typeof schoolName === 'string') {
      userUpdateData.name = schoolName.trim();
    }

    if (Object.keys(userUpdateData).length > 0) {
      console.log('Updating user with data:', userUpdateData);
      try {
        await User.update(userUpdateData, { where: { id: school.userId } });
        console.log('User updated successfully');
      } catch (userUpdateError: any) {
        console.error('Error updating user:', userUpdateError);
        // Don't throw here, continue with profile completion
      }
    }

    // Mark user profile as completed
    console.log('Marking user profile as completed for userId:', school.userId);
    try {
      await User.update(
        { profileCompleted: true },
        { where: { id: school.userId } }
      );
      console.log('User profile marked as completed');
    } catch (profileUpdateError: any) {
      console.error('Error updating user profile completion status:', profileUpdateError);
      throw new Error(`Failed to update profile completion status: ${profileUpdateError.message}`);
    }

    // Return success response
    console.log('Preparing success response');
    try {
      const finalSchool = await School.findByPk(school.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'profilePicture'],
        }],
      });

      console.log('Success response prepared successfully');
      return res.json({
        status: 'success',
        message: 'School profile completed successfully',
        school: finalSchool,
      });
    } catch (responseError: any) {
      console.error('Error preparing response:', responseError);
      // Return success without the include if there's an issue with associations
      return res.json({
        status: 'success',
        message: 'School profile completed successfully',
        school: {
          id: school.id,
          userId: school.userId,
          schoolName: school.schoolName,
          address: school.address,
          city: school.city,
          state: school.state,
          country: school.country,
        },
      });
    }
  } catch (error) {
    console.error('Complete school profile error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

export default router;