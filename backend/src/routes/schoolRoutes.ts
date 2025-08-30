import express from 'express';
import { Op } from 'sequelize';
import { School, User } from '../models';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Get school by userId (public endpoint)
router.get('/by-user/:userId', async (req, res) => {
  try {
    const school = await School.findOne({
      where: { userId: req.params.userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'name', 'profilePicture'],
      }],
    });
    if (!school) {
      return res.status(404).json({ status: 'error', message: 'School not found' });
    }
    res.json({ status: 'success', school });
  } catch (error: any) {
    console.error('Get school by userId error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Get all schools (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, state, schoolType } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    // Add search filter
    if (search) {
      whereClause.schoolName = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // Add location filters
    if (city) {
      whereClause.city = {
        [Op.iLike]: `%${city}%`,
      };
    }

    if (state) {
      whereClause.state = {
        [Op.iLike]: `%${state}%`,
      };
    }

    if (schoolType) {
      whereClause.schoolType = schoolType;
    }

    const schools = await School.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'name', 'profilePicture'],
      }],
      limit: Number(limit),
      offset,
      order: [['schoolName', 'ASC']],
    });

    res.json({
      status: 'success',
      schools: schools.rows,
      totalCount: schools.count,
      totalPages: Math.ceil(schools.count / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error: any) {
    console.error('Get schools error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Get school by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const school = await School.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'name', 'profilePicture'],
      }],
    });

    if (!school) {
      return res.status(404).json({ status: 'error', message: 'School not found' });
    }

    res.json({ status: 'success', school });
  } catch (error: any) {
    console.error('Get school error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Update school profile (school admin only)
router.put('/:id', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const school = await School.findByPk(req.params.id);

    if (!school) {
      return res.status(404).json({ status: 'error', message: 'School not found' });
    }

    // Check if user is the school admin
    if (school.userId !== req.user!.id) {
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
      accreditations,
      studentCount,
      teacherCount,
      establishedYear,
      description,
      facilities,
      extracurricularActivities,
      socialLinks,
    } = req.body;

    await school.update({
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
      socialLinks,
    });

    res.json({
      status: 'success',
      message: 'School profile updated successfully',
      school: await School.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'profilePicture'],
        }],
      }),
    });
  } catch (error: any) {
    console.error('Update school error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Get schools by location (public endpoint)
router.get('/location/:city', async (req, res) => {
  try {
    const schools = await School.findAll({
      where: {
        city: {
          [Op.iLike]: `%${req.params.city}%`,
        },
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profilePicture'],
      }],
      order: [['schoolName', 'ASC']],
    });

    res.json({ status: 'success', schools });
  } catch (error: any) {
    console.error('Get schools by location error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Get schools by type (public endpoint)
router.get('/type/:schoolType', async (req, res) => {
  try {
    const schools = await School.findAll({
      where: { schoolType: req.params.schoolType },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profilePicture'],
      }],
      order: [['schoolName', 'ASC']],
    });

    res.json({ status: 'success', schools });
  } catch (error: any) {
    console.error('Get schools by type error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Get featured/popular schools (public endpoint)
router.get('/featured/popular', async (req, res) => {
  try {
    const schools = await School.findAll({
      where: {
        studentCount: {
          [Op.gte]: 100, // Schools with 100+ students
        },
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profilePicture'],
      }],
      order: [['studentCount', 'DESC']],
      limit: 10,
    });

    res.json({ status: 'success', schools });
  } catch (error: any) {
    console.error('Get popular schools error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

export default router;