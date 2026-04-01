// backend/seeder/seedWarden.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.model.js';

dotenv.config();

const seedWarden = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if warden already exists
    const existingWarden = await User.findOne({ email: 'chappaamrutha@gmail.com' });
    if (existingWarden) {
      console.log('⚠️ Warden already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create warden
    const warden = await User.create({
      fullName: 'Amrutha Warden',
      email: 'chappaamrutha@gmail.com',
      password: hashedPassword,
      fieldId: 'W001',
      contact: '9876543210',
      role: 'warden',
      isVerified: true
    });

    console.log('✅ Warden created successfully');
    console.log('Email: chappaamrutha@gmail.com');
    console.log('Password: 123456');

  } catch (error) {
    console.error('❌ Error seeding warden:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

seedWarden();