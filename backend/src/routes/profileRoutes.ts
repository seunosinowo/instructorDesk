import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { User } from '../models';
import { Teacher, Student } from '../models';
import cloudinary from '../config/cloudinary';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }; // Changed to string for UUID
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Profile picture upload endpoint
router.post('/upload-picture', authMiddleware, upload.single('profilePicture'), async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'profile_pictures',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    const imageUrl = (result as any).secure_url;

    // Update user profile picture
    await User.update(
      { profilePicture: imageUrl },
      { where: { id: req.user!.id } }
    );

    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl 
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

// Update profile (PUT endpoint for editing)
router.put('/', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user name if provided
    if (req.body.name) {
      await User.update({ name: req.body.name }, { where: { id: user.id } });
    }

    if (user.role === 'teacher') {
      const {
        subjects,
        qualifications,
        experience,
        education,
        specializations,
        teachingMethods,
        availability,
        hourlyRate,
        location,
        languages,
        certifications,
        achievements,
        teachingPhilosophy,
        preferredStudentLevel,
        contactPreference,
        socialLinks
      } = req.body;

      await Teacher.upsert({
        userId: user.id,
        subjects,
        qualifications,
        experience,
        education,
        specializations,
        teachingMethods,
        availability,
        hourlyRate,
        location,
        languages,
        certifications,
        achievements,
        teachingPhilosophy,
        preferredStudentLevel,
        contactPreference,
        socialLinks
      });
    } else if (user.role === 'student') {
      const {
        interests,
        academicLevel,
        goals,
        learningStyle,
        preferredSubjects,
        currentInstitution,
        graduationYear,
        skills,
        projects,
        extracurriculars,
        careerGoals,
        preferredLearningTime,
        budget,
        location,
        languages,
        socialLinks
      } = req.body;

      await Student.upsert({
        userId: user.id,
        interests,
        academicLevel,
        goals,
        learningStyle,
        preferredSubjects,
        currentInstitution,
        graduationYear,
        skills,
        projects,
        extracurriculars,
        careerGoals,
        preferredLearningTime,
        budget,
        location,
        languages,
        socialLinks
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete profile setup
router.post('/', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'teacher') {
      const {
        subjects,
        qualifications,
        experience,
        education,
        specializations,
        teachingMethods,
        availability,
        hourlyRate,
        location,
        languages,
        certifications,
        achievements,
        teachingPhilosophy,
        preferredStudentLevel,
        contactPreference,
        socialLinks
      } = req.body;

      await Teacher.upsert({
        userId: user.id,
        subjects,
        qualifications,
        experience,
        education,
        specializations,
        teachingMethods,
        availability,
        hourlyRate,
        location,
        languages,
        certifications,
        achievements,
        teachingPhilosophy,
        preferredStudentLevel,
        contactPreference,
        socialLinks
      });
    } else if (user.role === 'student') {
      const {
        interests,
        academicLevel,
        goals,
        learningStyle,
        preferredSubjects,
        currentInstitution,
        graduationYear,
        skills,
        projects,
        extracurriculars,
        careerGoals,
        preferredLearningTime,
        budget,
        location,
        languages,
        socialLinks
      } = req.body;

      await Student.upsert({
        userId: user.id,
        interests,
        academicLevel,
        goals,
        learningStyle,
        preferredSubjects,
        currentInstitution,
        graduationYear,
        skills,
        projects,
        extracurriculars,
        careerGoals,
        preferredLearningTime,
        budget,
        location,
        languages,
        socialLinks
      });
    }

    await User.update({ profileCompleted: true }, { where: { id: user.id } });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile stats
router.get('/stats', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const userId = req.user!.id;
    
    // For now, return mock stats - you can implement actual counting later
    const stats = {
      connections: 0,
      posts: 0,
      reviews: 0,
      messages: 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profile = {};
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: user.id } });
      profile = teacher ? teacher.toJSON() : {};
    } else if (user.role === 'student') {
      const student = await Student.findOne({ where: { userId: user.id } });
      profile = student ? student.toJSON() : {};
    }

    res.json({ ...user.toJSON(), profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users for profile browsing
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let whereClause: any = { profileCompleted: true };
    if (role) {
      whereClause.role = role;
    }
    if (search) {
      whereClause.name = { [require('sequelize').Op.iLike]: `%${search}%` };
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'role', 'bio', 'profilePicture', 'createdAt'],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Get profile data for each user
    const usersWithProfiles = await Promise.all(
      users.rows.map(async (user) => {
        let profile = {};
        if (user.role === 'teacher') {
          const teacher = await Teacher.findOne({ where: { userId: user.id } });
          profile = teacher ? teacher.toJSON() : {};
        } else if (user.role === 'student') {
          const student = await Student.findOne({ where: { userId: user.id } });
          profile = student ? student.toJSON() : {};
        }
        return { ...user.toJSON(), profile };
      })
    );

    res.json({
      users: usersWithProfiles,
      totalCount: users.count,
      totalPages: Math.ceil(users.count / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;