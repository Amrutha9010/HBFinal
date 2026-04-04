// Payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  status: { type: String, default: "success" },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
