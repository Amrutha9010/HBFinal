// PaymentStatus.js
import mongoose from 'mongoose';

const paymentStatusSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String // ✅ New: Store student name
  },
  hasPaid: {
    type: Boolean,
    default: false
  },
  paymentDate: {
    type: Date
  },
  amountPaid: {
    type: Number
  },
  roomType: {
    type: String
  },
  acType: {
    type: String
  }
}, { timestamps: true });

const PaymentStatus = mongoose.model('PaymentStatus', paymentStatusSchema);

export default PaymentStatus;
