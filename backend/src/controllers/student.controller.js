// src/controllers/student.controller.js
import Student from "../models/Student.model.js";

export const getStudentDashboard = async (req, res) => {
  try {
    // Your dashboard logic here
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Welcome to Student Dashboard'
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

// Make sure to export all your controller functions
export default {
  getStudentDashboard,
  getAllStudents
  // Add other functions here as needed
};