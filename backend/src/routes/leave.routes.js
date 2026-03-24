import express from 'express';
import verifyToken from "../middleware/verifyToken.js";
import {
  applyLeave,
  getLeaveHistory,
  getPendingLeaves,
  updateLeaveStatus,
  getLeaveStats,
  deleteLeave,
  getStudentLeaveStats
} from '../controllers/leave.controller.js';

const router = express.Router();

// ✅ STUDENT ROUTES
router.post('/apply', verifyToken, applyLeave);
router.get('/history', verifyToken, getLeaveHistory);
router.delete('/:id', verifyToken, deleteLeave);

// ✅ DASHBOARD ROUTES (IMPORTANT)
router.get("/", verifyToken, getLeaveHistory);
router.get("/student-stats", verifyToken, getStudentLeaveStats);

// ✅ WARDEN ROUTES
router.get('/pending', verifyToken, getPendingLeaves);
router.put('/:id/status', verifyToken, updateLeaveStatus);
router.get('/stats', verifyToken, getLeaveStats);

export default router;