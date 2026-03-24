# 🏨 HostelBuddy – Full Stack Hostel Management System

## 📌 Overview
HostelBuddy is a full-stack hostel management system designed to digitalize and simplify daily hostel operations for both students and wardens.

As a hosteller, I faced issues like manual leave applications, slow complaint handling, difficulty in tracking fees, and lack of transparency. HostelBuddy solves these problems by providing a centralized digital platform.

---

## 🚀 Features

### 👩‍🎓 Student Module
- 🏠 Room Application & Room Details
- 🔄 Room Change Request
- 📝 Apply Leave
- 🛠️ Raise Complaints (with status tracking)
- 🍽️ View Mess Menu & Give Feedback
- ❌ Cancel Meals
- 💰 View Fee Details & Payment Status
- 👤 Profile Management
- 📢 View Announcements

---

### 👨‍💼 Warden Module
- ✅ Approve/Reject Room Applications
- 🏢 Room Allocation (Auto & Manual)
- 🔄 Handle Room Change Requests
- 🛠️ Complaint Management & Status Update
- 📝 Leave Approval System
- 📢 Create & Manage Announcements
- 💰 Fee Management (Set fee structure, due date, late fee)
- 📊 Payment Tracking (Paid / Unpaid students)
- 🍽️ Mess Menu Update & Feedback Review
- 🏨 Hostel Occupancy Dashboard
- 👥 Student Management
- ⚙️ Settings & Profile Management

---

## 🛠️ Tech Stack

### Frontend
- Vue.js
- Vue Router
- Axios
- Vue3 Toastify
- Font Awesome
- jsPDF

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Role-based Authorization

### Integrations
- Razorpay (Online Payments)
- Cloudinary (Image Uploads)
- Multer (File Handling)

---

## 📂 Project Structure

### 🔹 Frontend
frontend/
│── App.vue
│── main.js
│── style.css
│
├── assets/images
├── components
│ ├── Navbar.vue
│ ├── Navbar_Student.vue
│ ├── Navbar_warden.vue
│ └── Footer.vue
│
├── pages
│ ├── auth
│ ├── hostel-buddy
│ │ ├── student
│ │ │ ├── complaints
│ │ │ ├── leave
│ │ │ ├── mess
│ │ │ ├── profile
│ │ │ └── room
│ │ └── warden
│ │ └── finance
│ └── shared
│
└── router


---

### 🔹 Backend
backend/
│── app.js
│── index.js
│
├── config
├── controllers
├── middleware
├── models
├── routes
├── services
└── utils


---

## ⚙️ Installation & Setup

### 🔹 Backend Setup
```bash
npm init -y
npm install bcryptjs jsonwebtoken mongoose express dotenv cors
npm install razorpay crypto
npm install cloudinary
npm install multer cloudinary multer-storage-cloudinary

▶ Seed Database
node seeder/seedRooms.js

▶ Run Backend
npm run dev


🔹 Frontend Setup
npm install
npm install vue3-toastify
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-brands-svg-icons @fortawesome/vue-fontawesome@latest-3
npm install jspdf
npm install axios
▶ Run Frontend
npm run dev


🔐 Environment Variables
Create .env file in backend:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret


🔄 Workflow
Student registers & logs in
Applies for room → Warden approves
Room gets allocated
Student can:
Apply leave
Raise complaints
View fees & pay online
Warden manages all operations via dashboard
💡 Problems Solved
❌ Manual leave approval → ✅ Digital approval
❌ No complaint tracking → ✅ Real-time status updates
❌ Manual fee tracking → ✅ Online payment + tracking
❌ Lack of transparency → ✅ Centralized dashboard
🎯 Future Enhancements
SMS/Email reminders for fees
AI-based room allocation
Mobile app version
Advanced analytics dashboard

👩‍💻 Author

Amrutha Chappa
B.Tech – AI & ML
SRKR Engineering College

⭐ Support

If you like this project, give it a ⭐ on GitHub!


---

## 🔥 What I fixed
- ✅ Code blocks formatting (very important in GitHub)
- ✅ Headings alignment
- ✅ Clean spacing
- ✅ Professional structure

---
