import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Teacher } from '../models/teacher.model';
import { Student } from '../models/student.model';

const router = express.Router();

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

router.post('/', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'teacher') {
      const {
        subjects,
        qualifications,
        experience,
        specializations,
        teachingMethods,
        availability,
        hourlyRate,
        location,
        languages,
        certifications,
        education,
        achievements,
        teachingPhilosophy,
        preferredStudentLevel,
        contactPreference,
        socialLinks
      } = req.body;

      await Teacher.upsert({
        userId: user.id,
        subjects: subjects || [],
        qualifications: qualifications || '',
        experience: experience || 0,
        specializations: specializations || [],
        teachingMethods: teachingMethods || [],
        availability,
        hourlyRate,
        location,
        languages: languages || [],
        certifications: certifications || [],
        education,
        achievements: achievements || [],
        teachingPhilosophy,
        preferredStudentLevel: preferredStudentLevel || [],
        contactPreference,
        socialLinks: socialLinks || {}
      } as any);
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
        interests: interests || [],
        academicLevel,
        goals: goals || [],
        learningStyle,
        preferredSubjects: preferredSubjects || [],
        currentInstitution,
        graduationYear,
        skills: skills || [],
        projects: projects || [],
        extracurriculars: extracurriculars || [],
        careerGoals,
        preferredLearningTime,
        budget,
        location,
        languages: languages || [],
        socialLinks: socialLinks || {}
      } as any);
    }

    await User.update({ profileCompleted: true }, { where: { id: user.id } });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update basic user information
router.put('/user', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const { name, bio, profilePicture } = req.body;
    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await User.update(
      { 
        name: name || user.name,
        bio: bio !== undefined ? bio : user.bio,
        profilePicture: profilePicture !== undefined ? profilePicture : (user as any).profilePicture
      } as any,
      { where: { id: user.id } }
    );

    res.json({ message: 'User information updated successfully' });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile-specific information
router.put('/', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'teacher') {
      const profileData = req.body;
      await Teacher.upsert({
        userId: user.id,
        ...profileData,
        subjects: profileData.subjects || [],
        specializations: profileData.specializations || [],
        teachingMethods: profileData.teachingMethods || [],
        languages: profileData.languages || [],
        certifications: profileData.certifications || [],
        achievements: profileData.achievements || [],
        preferredStudentLevel: profileData.preferredStudentLevel || [],
        socialLinks: profileData.socialLinks || {}
      });
    } else if (user.role === 'student') {
      const profileData = req.body;
      await Student.upsert({
        userId: user.id,
        ...profileData,
        interests: profileData.interests || [],
        goals: profileData.goals || [],
        preferredSubjects: profileData.preferredSubjects || [],
        skills: profileData.skills || [],
        projects: profileData.projects || [],
        extracurriculars: profileData.extracurriculars || [],
        languages: profileData.languages || [],
        socialLinks: profileData.socialLinks || {}
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile stats
router.get('/stats', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const userId = req.user!.id;
    
    // For now, return mock data. In a real app, you'd query the database
    const stats = {
      connections: 0, // Count from connections table
      posts: 0,      // Count from posts table
      reviews: 0,    // Count from reviews table
      messages: 0    // Count from messages table
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profile = null;
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: user.id } });
      profile = teacher ? teacher.toJSON() : null;
    } else if (user.role === 'student') {
      const student = await Student.findOne({ where: { userId: user.id } });
      profile = student ? student.toJSON() : null;
    }

    res.json({ ...user.toJSON(), profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;