import express from 'express';
import { protect, restrictTo } from '../controllers/auth.controller.js';
import Student from '../models/Student.model.js';
import User from '../models/User.model.js';

const router = express.Router();

router.get('/count', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student count' });
  }
});

router.use(protect);
router.use(restrictTo('student'));

// Get authenticated student's allocation details
router.get('/me', async (req, res) => {
  try {
    if (!req.user?.fieldId) {
      return res.status(400).json({ message: 'Cannot determine student identity from token' });
    }

    let student = await Student.findOne({ rollNumber: req.user.fieldId }).select('-__v');

    if (!student) {
      // fallback on User data if Student record not yet created
      const user = await User.findOne({ fieldId: req.user.fieldId }).select('-password -__v');

      if (!user) {
        return res.status(404).json({ message: 'Student record not found' });
      }

      return res.status(200).json({
        ...user.toObject(),
        roomNo: user.roomNumber || 'Not Assigned',
        sharingType: user.sharingType || 'Not Assigned'
      });
    }

    return res.status(200).json(student);
  } catch (err) {
    console.error('Error fetching student profile:', err);
    res.status(500).json({ message: 'Failed to fetch student details' });
  }
});

export default router;
