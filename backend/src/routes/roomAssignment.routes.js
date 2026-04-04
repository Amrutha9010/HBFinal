// roomAssignment.routes.js
import express from "express";
import RoomApplication from "../models/roomApplicationModel.js";
import Student from "../models/Student.model.js";
import Room from "../models/roomModel.js";

const router = express.Router();

// Get suitable rooms for an application
router.get("/suitable-rooms/:applicationId", async (req, res) => {
  try {
    const application = await RoomApplication.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const studentSharing = parseInt(application.sharingType);

    const suitableRooms = await Room.find({
      acType: application.acType,
      capacity: studentSharing,
      $expr: {
        $lt: [{ $size: "$occupants" }, "$capacity"],
      },
    });

    res.status(200).json({
      success: true,
      data: suitableRooms.map((room) => ({
        roomNo: room.roomNo,
        block: room.block,
        floor: room.floor,
        capacity: room.capacity,
        availableBeds: room.capacity - room.occupants.length,
        acType: room.acType,
        sharingType: room.sharingType,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// ✅ Manual room assignment and student creation
router.post("/assign", async (req, res) => {
  const { applicationId, roomNo, block, floor } = req.body;

  try {
    const application = await RoomApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // 🔥 STEP 1: Remove old student from rooms (VERY IMPORTANT)
    const existingStudent = await Student.findOne({
      fieldId: application.rollNumber,
    });

    if (existingStudent) {
      await Room.updateMany(
        { "occupants.studentId": existingStudent._id },
        {
          $pull: {
            occupants: { studentId: existingStudent._id },
          },
        }
      );
    }

    // 🔥 STEP 2: Delete old student record
    await Student.deleteMany({ fieldId: application.rollNumber });

    // 🔥 STEP 3: Find room
    const room = await Room.findOne({
      roomNo,
      block,
      floor: Number(floor),
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // 🔥 STEP 4: Check capacity
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ error: "Room is full" });
    }

    // 🔥 STEP 5: Create new student
    const newStudent = new Student({
      fullName: application.fullName,
      rollNumber: application.rollNumber,
      fieldId: application.rollNumber,
      branchYear: application.branchYear,
      gender: application.gender,
      phone: application.phone,
      parentPhone: application.parentPhone,
      address: application.address,
      medicalInfo: application.medicalInfo,
      acType: application.acType,
      sharingType: application.sharingType,
      studentPhoto: application.studentPhoto,
      aadhaar: application.aadhaar,
      collegeId: application.collegeId,
      email: application.email,
      roomNo,
      block,
      floor,
      joinDate: new Date(),
    });

    const savedStudent = await newStudent.save();

    // 🔥 STEP 6: Add to room occupants (correct format)
    room.occupants.push({
      studentId: savedStudent._id,
      joinDate: new Date(),
    });

    await room.save();

    // 🔥 STEP 7: Delete application
    await RoomApplication.findByIdAndDelete(applicationId);

    res.status(200).json({
      message: "Room assigned and student created successfully",
    });

  } catch (err) {
    console.error("🔥 Assignment error:", err);
    res.status(500).json({
      error: err.message || "Something went wrong during assignment",
    });
  }
});

export default router;