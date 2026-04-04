// payment.controller.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.model.js"; // Ensure your Payment model is correct
import Student from "../models/Student.model.js";
import FeeStructure from "../models/FeeStructure.js";

//  Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// Get fee for logged-in student
export const getStudentFee = async (req, res) => {
  try {
    const { studentId } = req.query;

    const student = await Student.findOne({ fieldId: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const fee = await FeeStructure.findOne({
      roomType: mapSharing(student.sharingType),
      acType: student.acType.toLowerCase(),
    });

    if (!fee) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    res.json({
      amount: fee.monthlyFee,
      dueDate: fee.dueDate,
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching fee" });
  }
};

// helper
function mapSharing(sharing) {
  const map = {
    "1": "single",
    "2": "double",
    "3": "triple",
    "4": "four-sharing",
    "5": "five-sharing"
  };
  return map[sharing];
}

//  Create order
export const createOrder = async (req, res) => {
  try {
    console.log("🔹 Incoming Body:", req.body);

    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Order creation failed", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

//  Verify payment and save to DB
export const verifyPayment = async (req, res) => {
  try {
    console.log("🔹 VERIFY PAYMENT BODY:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentName,
      studentId,
      email,
      amount,
    } = req.body;

    //  Debugging missing values
    if (!studentName || !studentId || !email) {
      console.error("❌ Missing required student fields!", { studentName, studentId, email });
    }

    //   Razorpay signature verification
    const bodyData = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(bodyData.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    //  Save to DB
    const payment = new Payment({
      studentName,
      studentId,
      email,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: "success",
    });

    await payment.save();

    console.log(" Payment saved successfully!");
    res.json({ success: true, message: "Payment verified & saved" });
  } catch (error) {
    console.error("Payment verification failed", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

//  Fetch payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const history = await Payment.find({ studentId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};
