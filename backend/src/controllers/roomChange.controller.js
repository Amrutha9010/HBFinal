// controllers/roomChangeController.js
import RoomChangeRequest from '../models/RoomChange.model.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/v1/room-change
export const submitRoomChange = asyncHandler(async (req, res) => {
  try {
    console.log("📩 Room change request received");
    console.log("Request user:", req.user);
    console.log("Request body:", req.body);
    
    const { studentName, currentRoom, preferredBlock, preferredRoomNumber, reason } = req.body;
    const studentId = req.user._id;

    // Validate required fields
    if (!studentName || !currentRoom || !preferredBlock || !preferredRoomNumber || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: studentName, currentRoom, preferredBlock, preferredRoomNumber, reason'
      });
    }

    const newRequest = await RoomChangeRequest.create({
      student: studentId,
      studentName: studentName.trim(),
      currentRoom: currentRoom.trim(),
      preferredBlock,
      preferredRoomNumber: preferredRoomNumber.trim(),
      reason: reason.trim(),
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Room change request submitted successfully',
      data: newRequest,
    });
  } catch (error) {
    console.error("❌ Error creating room change request:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// GET /api/v1/room-change/my-requests
export const getMyRoomChangeRequests = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const requests = await RoomChangeRequest.find({ student: studentId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: requests,
  });
});

export const getLatestRoomChangeRequest = asyncHandler(async (req, res) => {
  const latestRequest = await RoomChangeRequest.findOne({ student: req.user._id })
    .sort({ createdAt: -1 });

  if (!latestRequest) {
    return res.status(404).json({ message: 'No room change request found.' });
  }

  res.status(200).json(latestRequest);
});

export const getRoomChangeHistory = async (req, res) => {
  const history = await RoomChangeRequest.find({ student: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(history);
};

// GET /api/v1/room-change/all → Warden views all student requests
export const getAllRoomChangeRequests = asyncHandler(async (req, res) => {
  const requests = await RoomChangeRequest.find()
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: requests,
  });
});

// PUT /api/v1/room-change/:id/status → Warden updates status
export const updateRoomChangeStatus = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const request = await RoomChangeRequest.findById(requestId);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Room change request not found' });
  }

  request.status = status;
  request.updatedAt = Date.now();
  await request.save();

  res.status(200).json({
    success: true,
    message: `Request has been ${status.toLowerCase()}`,
    data: request,
  });
});