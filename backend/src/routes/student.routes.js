import express from 'express';
import { protect, restrictTo } from '../controllers/auth.controller.js';
import Student from '../models/Student.model.js';

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

export default router;
