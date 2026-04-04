// paymentStatus.js
import express from 'express';
import PaymentStatus from '../models/PaymentStatus.js';

const router = express.Router();

// ✅ Create or update payment status for a student
router.post('/', async (req, res) => {
  try {
    const { studentId, name, hasPaid, paymentDate, amountPaid, roomType, acType } = req.body;

    const updated = await PaymentStatus.findOneAndUpdate(
      { studentId },
      { name, hasPaid, paymentDate, amountPaid, roomType, acType },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save payment status.' });
  }
});

// ✅ Get payment status for a specific student
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const status = await PaymentStatus.findOne({ studentId });
    if (!status) {
      return res.status(404).json({ error: 'Payment status not found' });
    }
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment status.' });
  }
});

// ✅ Get all payment statuses (for warden use)
router.get('/', async (req, res) => {
  try {
    const allStatuses = await PaymentStatus.find();
    res.status(200).json(allStatuses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment statuses.' });
  }
});

export default router;
