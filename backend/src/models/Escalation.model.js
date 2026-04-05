import mongoose from "mongoose";

const escalationSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
    },

    studentName: {
      type: String,
    },

    email: {
      type: String,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    attachment: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Escalation", escalationSchema);
