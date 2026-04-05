// src/controllers/student.controller.js
import Student from "../models/Student.model.js";
import User from "../models/User.model.js";
import Payment from "../models/Payment.model.js"; 
import RoomApplication from "../models/roomApplicationModel.js";

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

        const user = await User.findOne({ fieldId: s.fieldId });

        const application = await RoomApplication.findOne({
          rollNumber: s.rollNumber
        });

        const payment = await Payment.findOne({
          studentId: s.fieldId
        });

        return {
          _id: s._id,
          fullName: s.fullName,
          rollNumber: s.rollNumber,
          roomNo: s.roomNo,

          // ✅ CONTACT
          email: user?.email || "N/A",
          phone: application?.phone || user?.contact || "N/A",
          address: application?.address || "N/A",

          // ✅ IMAGES
          studentPhoto: application?.studentPhoto || "",
          aadhaar: application?.aadhaar || "",
          collegeId: application?.collegeId || "",

          // ✅ PAYMENT
          paid: payment?.status === "Paid",
          balance: payment?.remainingAmount || 0
        };
      })
    );

    res.json({ success: true, data: fullData });

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