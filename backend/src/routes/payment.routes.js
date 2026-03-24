import express from "express";
import { createOrder, verifyPayment, getPaymentHistory } from "../controllers/payment.controller.js";
import Payment from '../models/Payment.model.js';

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/history", getPaymentHistory);

router.get('/defaulters-count', async (req, res) => {
  try {
    // Example logic: students who did NOT pay
    // (you can improve later)

    const totalStudents = await Payment.distinct('studentId');
    const paidStudents = await Payment.find({ status: 'success' }).distinct('studentId');

    const defaulters = totalStudents.filter(id => !paidStudents.includes(id));

    res.json({ count: defaulters.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching defaulters' });
  }
});

export default router;
