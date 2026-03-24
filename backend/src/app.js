import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import apiRouter from './routes/api.routes.js';
import paymentRouter from './routes/payment.routes.js';  // ✅ Add this
import errorHandler from './middleware/errorHandler.js';
import announcementRoutes from "./routes/announcement.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import feeStructureRoutes from './routes/feeStructure.js';
import paymentStatusRoutes from './routes/paymentStatus.js';
import roomApplicationRoutes from './routes/roomApplicationRoutes.js';
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("HostelBuddy Backend is Running 🚀");
});

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// ✅ Existing routes (unchanged)
app.use('/api/v1/auth', authRouter);
app.use(apiRouter);

// ✅ Razorpay payment routes (direct mount)
app.use('/api/v1/payment', paymentRouter);
app.use("/api/announcements", announcementRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/fee-structure", feeStructureRoutes);
app.use('/api/payment-status', paymentStatusRoutes);
app.use('/api/room-application', roomApplicationRoutes);
app.use(errorHandler);

export default app;
