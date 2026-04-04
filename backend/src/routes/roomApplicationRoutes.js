// roomApplicationRoutes.js
import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import RoomApplication from '../models/roomApplicationModel.js';
import Student from '../models/Student.model.js';
import User from '../models/User.model.js';
import Room from '../models/roomModel.js';
const router = express.Router();
const upload = multer({ storage });

// POST /api/room-applications
router.post(
  '/',
  upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'aadhaar', maxCount: 1 },
    { name: 'collegeId', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // 🔒 Prevent duplicate application
const existingApplication = await RoomApplication.findOne({
  rollNumber: req.body.rollNumber,
  status: { $in: ['Pending', 'Approved'] }
});

if (existingApplication) {
  return res.status(400).json({
    success: false,
    message: 'You have already applied for hostel'
  });
}
      const {
        fullName,
        rollNumber,
        branchYear,
        gender,
        phone,
        parentPhone,
        address,
        medicalInfo,
        sharingType,
        acType,
      } = req.body;

      const studentPhoto = req.files?.studentPhoto?.[0]?.path || '';
      const aadhaar = req.files?.aadhaar?.[0]?.path || '';
      const collegeId = req.files?.collegeId?.[0]?.path || '';

      const newApplication = new RoomApplication({
        fullName,
        rollNumber,
        branchYear,
        gender,
        phone,
        parentPhone,
        address,
        medicalInfo,
        sharingType,
        acType,
        studentPhoto,
        aadhaar,
        collegeId,
      });

      await newApplication.save();
      res.status(201).json({ success: true, message: 'Application submitted with files!' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/room-applications?status=Pending or Approved
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const applications = await RoomApplication.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/room-applications/:id/approve
router.put('/:id/approve', async (req, res) => {
  try {
    const { assignedRoom, joinDate } = req.body;

    // First validate the room exists and has capacity
    const room = await Room.findOne({ roomNo: assignedRoom });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ success: false, message: 'Room is at full capacity' });
    }

    // Update application status
    const application = await RoomApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        assignedRoom,
        joinDate: joinDate || new Date(),
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if student already exists in Student collection
    let studentRecord = await Student.findOne({ rollNumber: application.rollNumber });

    if (!studentRecord) {
      studentRecord = new Student({
        fullName: application.fullName,
        rollNumber: application.rollNumber,
        roomNo: assignedRoom,
        block: room.block,
        floor: room.floor,
        bedNo: '1',
        acType: application.acType,
        joinDate: application.joinDate,
        branchYear: application.branchYear,
        gender: application.gender,
        phone: application.phone,
        parentPhone: application.parentPhone,
        address: application.address,
        medicalInfo: application.medicalInfo,
        sharingType: application.sharingType,
        studentPhoto: application.studentPhoto,
        aadhaar: application.aadhaar,
        collegeId: application.collegeId,
      });

      await studentRecord.save();
    } else {
      // Update assignment details for existing student record
      studentRecord.roomNo = assignedRoom;
      studentRecord.block = room.block;
      studentRecord.floor = room.floor;
      studentRecord.bedNo = '1';
      studentRecord.joinDate = application.joinDate || new Date();
      studentRecord.acType = application.acType;
      studentRecord.sharingType = application.sharingType;
      await studentRecord.save();
    }

    // Update user record so auth/profile matches assignment immediately
    await User.findOneAndUpdate(
      { fieldId: application.rollNumber },
      { roomNumber: assignedRoom },
      { new: true }
    );

    // Update room occupants
    if (!room.occupants.includes(studentRecord._id)) {
      room.occupants.push(studentRecord._id);
    }
    await room.save();

    res.status(200).json({ 
      success: true, 
      data: application,
      message: 'Student approved and room assigned successfully'
    });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to approve application'
    });
  }
});

export default router;