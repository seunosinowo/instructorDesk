import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware } from '../middleware/authMiddleware';
import { User } from '../models';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload profile picture
router.post('/profile-picture', authMiddleware, upload.single('profilePicture'), async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user!.id;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'profile_pictures',
          public_id: `profile_${userId}`,
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

    const result = uploadResult as any;

    // Update user's profile picture URL in database
    await User.update(
      { profilePicture: result.secure_url },
      { where: { id: userId } }
    );

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: result.secure_url
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Upload post image
router.post('/post-image', authMiddleware, upload.single('image'), async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user!.id;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'post_images',
          public_id: `post_${userId}_${Date.now()}`,
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    const result = uploadResult as any;

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url
    });

  } catch (error) {
    console.error('Post image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;