// roomChange.routes.js
 import express from 'express';
 import { submitRoomChange,
       getMyRoomChangeRequests, 
       getRoomChangeHistory,
       getAllRoomChangeRequests,
       updateRoomChangeStatus
     } from '../controllers/roomChange.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.post('/room-change', protect, restrictTo('student'), submitRoomChange);

// Student fetches latest request
router.get('/room-change/latest',  protect, restrictTo('student'), getMyRoomChangeRequests);

// Student fetches their past requests
router.get('/room-change/history', protect, restrictTo('student'), getRoomChangeHistory);

//wardens can see the requests submitted by students
router.get('/room-change/all', protect, restrictTo('warden'), getAllRoomChangeRequests);

//warden can approve or reject the requests
router.put('/room-change/:id/status', protect, restrictTo('warden'), updateRoomChangeStatus);


export default router;