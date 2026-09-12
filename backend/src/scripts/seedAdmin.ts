import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { connectDB } from '../config/db';

dotenv.config();

// Run this once before deployment or after wiping the database
// Usage: npm run seed:admin
const seedAdmin = async () => {
  try {
    await connectDB();

    const adminName = process.env.ADMIN_NAME || 'System Administrator';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@taskgimi.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Administrator account already exists: ${adminEmail}`);

      // If the account exists but was somehow demoted or unapproved, fix it
      if (existingAdmin.role !== 'admin' || !existingAdmin.isApproved) {
        existingAdmin.role = 'admin';
        existingAdmin.isApproved = true;
        await existingAdmin.save();
        console.log(`[Seed] Updated role/approval for admin: ${adminEmail}`);
      }
    } else {
      // Admin accounts bypass the approval workflow — they're always active immediately
      const newAdmin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isApproved: true,
      });
      console.log(`[Seed] Successfully created initial Administrator account:`);
      console.log(`       Name: ${newAdmin.name} | Email: ${newAdmin.email} | Role: ${newAdmin.role}`);
    }

    // Also seed a normal test user so evaluators can test both roles without registering
    const userEmail = 'jane@example.com';
    const existingUser = await User.findOne({ email: userEmail });

    if (existingUser) {
      console.log(`[Seed] Normal User account already exists: ${userEmail}`);
      if (!existingUser.isApproved) {
        existingUser.isApproved = true;
        await existingUser.save();
        console.log(`[Seed] Approved existing user: ${userEmail}`);
      }
    } else {
      const newUser = await User.create({
        name: 'Jane Doe',
        email: userEmail,
        password: 'Password123',
        role: 'user',
        isApproved: true,
      });
      console.log(`[Seed] Successfully created initial Normal User account:`);
      console.log(`       Name: ${newUser.name} | Email: ${newUser.email} | Role: ${newUser.role}`);
    }

    console.log('[Seed] Database seeding completed successfully.');
  } catch (error) {
    console.error('[Seed] Error seeding administrator account:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();
