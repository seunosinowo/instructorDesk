import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { User, Message, School } from '../models';
import { Teacher, Student } from '../models';
import cloudinary from '../config/cloudinary';
import { requireProfileCompletion } from '../middleware/profileCompletionMiddleware';

const router = express.Router();

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

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Profile routes are working', timestamp: new Date().toISOString() });
});

// Debug endpoint to check raw profile data
router.get('/debug/:id', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profileData = null;
    if (user.role === 'teacher') {
      profileData = await Teacher.findOne({ where: { userId: user.id } });
    } else if (user.role === 'student') {
      profileData = await Student.findOne({ where: { userId: user.id } });
    } else if (user.role === 'school') {
      profileData = await School.findOne({ where: { userId: user.id } });
    }

    res.json({
      user: user.toJSON(),
      profile: profileData ? profileData.toJSON() : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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
    console.log('Profile update request received');
    console.log('User ID:', req.user!.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user fields if provided
    const userUpdateData: any = {};
    if (req.body.name) userUpdateData.name = req.body.name;
    if (req.body.bio !== undefined) userUpdateData.bio = req.body.bio; // Allow empty string to clear bio
    if (req.body.email) userUpdateData.email = req.body.email;
    
    if (Object.keys(userUpdateData).length > 0) {
      console.log('Updating user with data:', userUpdateData);
      await User.update(userUpdateData, { where: { id: user.id } });
      console.log('User updated successfully');
    }

    if (user.role === 'teacher') {
      console.log('Processing teacher profile update');
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

      const teacherData = {
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
      };
      
      console.log('Teacher data to upsert:', JSON.stringify(teacherData, null, 2));
      const [teacherProfile, created] = await Teacher.upsert(teacherData);
      console.log('Teacher profile upserted:', created ? 'created' : 'updated', teacherProfile.toJSON());
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

      // Convert goals array to string for database storage
      const goalsString = Array.isArray(goals) ? goals.join('\n') : goals;

      const studentData = {
        userId: user.id,
        interests,
        academicLevel,
        goals: goalsString,
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
      };

      console.log('Student data to upsert:', JSON.stringify(studentData, null, 2));
      const [studentProfile, created] = await Student.upsert(studentData);
      console.log('Student profile upserted:', created ? 'created' : 'updated', studentProfile.toJSON());
    } else if (user.role === 'school') {
      console.log('Processing school profile update');
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
        accreditations,
        studentCount,
        teacherCount,
        establishedYear,
        description,
        facilities,
        extracurricularActivities,
        socialLinks
      } = req.body;

      const schoolData = {
        userId: user.id,
        schoolName,
        address,
        city,
        state,
        country,
        phoneNumber,
        website,
        schoolType,
        gradeLevels,
        accreditations,
        studentCount,
        teacherCount,
        establishedYear,
        description,
        facilities,
        extracurricularActivities,
        socialLinks
      };

      console.log('School data to upsert:', JSON.stringify(schoolData, null, 2));
      const [schoolProfile, created] = await School.upsert(schoolData);
      console.log('School profile upserted:', created ? 'created' : 'updated', schoolProfile.toJSON());

      // Update user name if schoolName is provided
      if (schoolName && typeof schoolName === 'string') {
        console.log('Updating user name to:', schoolName);
        await User.update(
          { name: schoolName.trim() },
          { where: { id: user.id } }
        );
        console.log('User name updated successfully');
      }
    }

    console.log('Profile update completed successfully');
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

      // Convert goals array to string for database storage
      const goalsString = Array.isArray(goals) ? goals.join('\n') : goals;

      await Student.upsert({
        userId: user.id,
        interests,
        academicLevel,
        goals: goalsString,
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
    } else if (user.role === 'school') {
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
        accreditations,
        studentCount,
        teacherCount,
        establishedYear,
        description,
        facilities,
        extracurricularActivities,
        socialLinks
      } = req.body;

      await School.upsert({
        userId: user.id,
        schoolName,
        address,
        city,
        state,
        country,
        phoneNumber,
        website,
        schoolType,
        gradeLevels,
        accreditations,
        studentCount,
        teacherCount,
        establishedYear,
        description,
        facilities,
        extracurricularActivities,
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

// Get profile settings (for settings page)
router.get('/settings', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/delete', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete profile data first
    if (user.role === 'teacher') {
      await Teacher.destroy({ where: { userId: user.id } });
    } else if (user.role === 'student') {
      await Student.destroy({ where: { userId: user.id } });
    } else if (user.role === 'school') {
      await School.destroy({ where: { userId: user.id } });
    }

    // Delete all messages where user is sender or receiver
    await Message.destroy({ where: { senderId: user.id } });
    await Message.destroy({ where: { receiverId: user.id } });

    // Delete user account
    await User.destroy({ where: { id: user.id } });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
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
      if (student) {
        profile = student.toJSON();
        // Convert goals string back to array for frontend
        if ((profile as any).goals && typeof (profile as any).goals === 'string') {
          (profile as any).goals = (profile as any).goals.split('\n').filter((goal: string) => goal.trim());
        }
      }
    } else if (user.role === 'school') {
      const school = await School.findOne({ where: { userId: user.id } });
      profile = school ? school.toJSON() : {};
    }

    res.json({ ...user.toJSON(), profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users for profile browsing
router.get('/', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // console.log('Profile browsing request:', { role, search, page, limit, currentUser: req.user });
    
    let whereClause: any = {};
    if (role) {
      whereClause.role = role;
    }
    if (search) {
      whereClause.name = { [require('sequelize').Op.iLike]: `%${search}%` };
    }
    
    // console.log('Where clause:', whereClause);

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'role', 'bio', 'profilePicture', 'createdAt'],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    // console.log('Found users:', users.count);

    // Get profile data for each user
    const usersWithProfiles = await Promise.all(
      users.rows.map(async (user) => {
        let profile = {};
        if (user.role === 'teacher') {
          const teacher = await Teacher.findOne({ where: { userId: user.id } });
          profile = teacher ? teacher.toJSON() : {};
        } else if (user.role === 'student') {
          const student = await Student.findOne({ where: { userId: user.id } });
          if (student) {
            profile = student.toJSON();
            // Convert goals string back to array for frontend
            if ((profile as any).goals && typeof (profile as any).goals === 'string') {
              (profile as any).goals = (profile as any).goals.split('\n').filter((goal: string) => goal.trim());
            }
          }
        } else if (user.role === 'school') {
          const school = await School.findOne({ where: { userId: user.id } });
          profile = school ? school.toJSON() : {};
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