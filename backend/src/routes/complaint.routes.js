// complaint.routes.js
import express from 'express';
import Complaint from '../models/Complaint.model.js';
import upload from '../middleware/uploadImage.js';
import verifyToken from '../middleware/verifyToken.js'; // ✅ Token validation
import {
  getMyComplaints,
  updateComplaintStatus, // or updateComplaintStatusSimple
    getPendingComplaintCount,
} from '../controllers/complaint.controller.js';
import { getAllComplaints } from '../controllers/warden.controller.js';

const router = express.Router();

// ✅ POST Complaint with Image + Authentication
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { category, description } = req.body;
    const imageUrl = req.file ? req.file.path : '';

    const complaint = new Complaint({
      category,
      description,
      imageUrl,
      submittedBy: req.user._id
    });

    const savedComplaint = await complaint.save();
    res.status(201).json(savedComplaint);
  } catch (err) {
    console.error('❌ Complaint Save Error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.get('/my', verifyToken, getMyComplaints);
router.get('/all', verifyToken, getAllComplaints);

// ✅ Add this to enable status updates (full or simple)
router.put('/:id/status', verifyToken, updateComplaintStatus); 
router.get('/pending-count', getPendingComplaintCount);

// or
// router.put('/:id/simple-status', verifyToken, updateComplaintStatusSimple);

export default router;