// models/RoomChange.model.js
import mongoose from 'mongoose';

const roomChangeRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  currentRoom: {
    type: String,
    required: true,
  },
  preferredBlock: {
    type: String,
    required: true,
  },
  preferredRoomNumber: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const RoomChangeRequest = mongoose.model('RoomChangeRequest', roomChangeRequestSchema);
export default RoomChangeRequest;