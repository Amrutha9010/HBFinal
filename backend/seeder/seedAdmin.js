import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'principal@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      return;
    }

    const admin = await User.create({
      fullName: 'Principal',
      email: 'principal@gmail.com',
      password: '12345678',
      fieldId: 'ADMIN001',
      contact: '1234567890',
      role: 'admin',
      isVerified: true
    });

    console.log('✅ Admin created successfully');
    console.log('Email: principal@gmail.com');
    console.log('Password: 12345678');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

seedAdmin();