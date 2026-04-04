// FeeStructure.js
import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema({
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'four-sharing', 'five-sharing'],
    required: true,
  },
  acType: {
    type: String,
    enum: ['ac', 'non-ac'],
    required: true,
  },
  monthlyFee: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Number,
    required: true,
    min: 1,
    max: 31,
  },
  lateFeePerDay: {
    type: Number,
    required: true,
  },
  maxLateDays: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

export default FeeStructure;
