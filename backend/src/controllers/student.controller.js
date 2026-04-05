// src/controllers/student.controller.js
import Student from "../models/Student.model.js";
import User from "../models/User.model.js";
import PaymentStatus from "../models/PaymentStatus.js";

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
    const students = await Student.find();

    const fullData = await Promise.all(
      students.map(async (s) => {

        // 🔹 Get email from User
        const user = await User.findOne({ fieldId: s.fieldId });

        // 🔹 Get payment status (CORRECT MODEL)
        const paymentStatus = await PaymentStatus.findOne({
          studentId: s.fieldId
        });

        return {
          _id: s._id,

          // ✅ BASIC
          fullName: s.fullName,
          rollNumber: s.rollNumber,
          roomNo: s.roomNo,

          // ✅ DIRECT FROM STUDENT (NO MORE ROOMAPPLICATION)
          phone: s.phone || "N/A",
          address: s.address || "N/A",
          studentPhoto: s.studentPhoto || "",
          aadhaar: s.aadhaar || "",
          collegeId: s.collegeId || "",

          // ✅ USER
          email: user?.email || "N/A",

          // ✅ PAYMENT (FIXED)
          paid: paymentStatus?.hasPaid || false,
          balance: paymentStatus?.hasPaid ? 0 : (paymentStatus?.amountPaid || 0)
        };
      })
    );

    res.json({
      success: true,
      data: fullData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching students" });
  }
};

// Make sure to export all your controller functions
export default {
  getStudentDashboard,
  getAllStudents
  // Add other functions here as needed
};