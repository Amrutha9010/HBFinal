import Escalation from "../models/Escalation.model.js";

// 🔹 CREATE escalation
export const createEscalation = async (req, res) => {
  try {
    const { studentId, studentName, email, category, description, isAnonymous } = req.body;

    const escalation = new Escalation({
      studentId: isAnonymous === "true" ? null : studentId,
      studentName: isAnonymous === "true" ? "Anonymous" : studentName,
      email: isAnonymous === "true" ? null : email,
      category,
      description,
      isAnonymous,
      attachment: req.file ? req.file.path : "",
    });

    await escalation.save();

    res.status(201).json({
      success: true,
      message: "Escalation submitted successfully",
    });

  } catch (err) {
    console.error("Escalation Error:", err);
    res.status(500).json({ success: false, message: "Failed to submit escalation" });
  }
};


// 🔹 GET all escalations (ONLY HIGHER AUTHORITY)
export const getAllEscalations = async (req, res) => {
  try {
    const escalations = await Escalation.find().sort({ createdAt: -1 });

    res.status(200).json(escalations);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch escalations" });
  }
};


// 🔹 UPDATE status
export const updateEscalationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Escalation.findByIdAndUpdate(
      id,
      { status: "Resolved" },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};