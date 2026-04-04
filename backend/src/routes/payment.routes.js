// payment.routes.js
import express from "express";
import { createOrder, verifyPayment, getPaymentHistory } from "../controllers/payment.controller.js";
import Payment from '../models/Payment.model.js';
import { getStudentFee } from "../controllers/payment.controller.js";
import Student from "../models/Student.model.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/history", getPaymentHistory);
router.get("/student-fee", getStudentFee);

router.get('/defaulters-count', async (req, res) => {
  try {
    const students = await Student.find();

    const payments = await Payment.find();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const paidStudents = payments
      .filter(p => {
        const d = new Date(p.createdAt);
        return d.getMonth() === currentMonth &&
               d.getFullYear() === currentYear;
      })
      .map(p => p.studentId);

    const defaulters = students.filter(
      s => !paidStudents.includes(s.fieldId)
    );

    res.json({ count: defaulters.length });

  } catch (err) {
    res.status(500).json({ message: 'Error fetching defaulters' });
  }
});

export default router;
