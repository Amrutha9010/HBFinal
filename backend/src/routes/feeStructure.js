// feeStructure.js
import express from 'express';
import FeeStructure from '../models/FeeStructure.js';

const router = express.Router();

// ✅ Create or update (by roomType & acType)
router.post('/', async (req, res) => {
  try {
    const { roomType, acType, monthlyFee, dueDate, lateFeePerDay, maxLateDays } = req.body;

    const updated = await FeeStructure.findOneAndUpdate(
      { roomType, acType },
      { monthlyFee, dueDate, lateFeePerDay, maxLateDays },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save fee structure.' });
  }
});

// ✅ Get all fee structures
router.get('/', async (req, res) => {
  try {
    const structures = await FeeStructure.find();
    res.status(200).json(structures);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fee structures.' });
  }
});

// ✅ Edit/Update by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { roomType, acType, monthlyFee, dueDate, lateFeePerDay, maxLateDays } = req.body;

    const updated = await FeeStructure.findByIdAndUpdate(
      id,
      { roomType, acType, monthlyFee, dueDate, lateFeePerDay, maxLateDays },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Fee structure not found.' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update fee structure.' });
  }
});

// ✅ Delete by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await FeeStructure.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Fee structure not found.' });
    }

    res.status(200).json({ message: 'Fee structure deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete fee structure.' });
  }
});

export default router;
