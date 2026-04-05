import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.model.js';

dotenv.config();

const addAdminUser = async () => {
  try {
    // Connect to the database (will use production DB when deployed)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'principal@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('12345678', salt);

    // Create the admin user
    const adminUser = await User.create({
      fullName: 'Principal',
      email: 'principal@gmail.com',
      password: hashedPassword,
      fieldId: 'ADMIN001',
      contact: '1234567890',
      role: 'admin',
      isVerified: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: principal@gmail.com');
    console.log('Password: 12345678');
    console.log('Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the function
addAdminUser();