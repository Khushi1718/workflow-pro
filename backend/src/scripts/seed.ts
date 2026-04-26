import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import WorkLog from '../models/WorkLog.js';
import { connectDB } from '../config/database.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');
    
    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await WorkLog.deleteMany({});

    // Create test users
    console.log('👥 Creating test users...');
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@google.com',
      password: 'password123',
      role: 'admin',
      team: 'Management',
      isActive: true,
    });
    await adminUser.save();
    console.log(`✅ Admin created: ${adminUser.email}`);

    const employeeUser = new User({
      name: 'Ms. Khushi',
      email: 'khushi@google.com',
      password: 'password123',
      role: 'employee',
      team: 'Development',
      isActive: true,
    });
    await employeeUser.save();
    console.log(`✅ Employee created: ${employeeUser.email}`);

    const employeeUser2 = new User({
      name: 'Aarav Singh',
      email: 'aarav@google.com',
      password: 'password123',
      role: 'employee',
      team: 'Design',
      isActive: true,
    });
    await employeeUser2.save();
    console.log(`✅ Employee created: ${employeeUser2.email}`);

    // Create sample work logs
    console.log('\n📝 Creating sample work logs...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sampleLogs = [
      {
        userId: employeeUser._id,
        title: 'Database Optimization',
        accomplishments: 'Optimized MongoDB queries and added proper indexing for better performance. Achieved 40% faster query execution.',
        meetingsAttended: 2,
        focusForTomorrow: 'Complete API authentication module',
        status: 'completed',
        date: new Date(today),
        meetingNotes: 'Performance review meeting successful',
        attachments: [],
      },
      {
        userId: employeeUser._id,
        title: 'Bug Fixes and Testing',
        accomplishments: 'Fixed 5 critical bugs in the authentication flow. Added comprehensive test coverage.',
        meetingsAttended: 1,
        focusForTomorrow: 'Implement notification system',
        status: 'completed',
        date: new Date(today),
        attachments: [],
      },
      {
        userId: employeeUser2._id,
        title: 'UI Component Development',
        accomplishments: 'Created 8 new reusable UI components with full accessibility support.',
        meetingsAttended: 1,
        focusForTomorrow: 'Design system documentation',
        status: 'completed',
        date: new Date(today),
        attachments: [],
      },
      {
        userId: employeeUser._id,
        title: 'API Development',
        accomplishments: 'Developed REST APIs for work log management with proper validation and error handling.',
        meetingsAttended: 0,
        focusForTomorrow: 'Add caching layer',
        status: 'in_progress',
        date: new Date(new Date(today).getTime() - 24 * 60 * 60 * 1000), // Yesterday
        attachments: [],
      },
      {
        userId: employeeUser2._id,
        title: 'Design Review',
        accomplishments: 'Conducted design review with team. Updated design system and component guidelines.',
        meetingsAttended: 3,
        focusForTomorrow: 'Create design specifications',
        status: 'completed',
        date: new Date(new Date(today).getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        attachments: [],
      },
    ];

    for (const log of sampleLogs) {
      const workLog = new WorkLog(log);
      await workLog.save();
      console.log(`✅ Work log created: "${log.title}"`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Admin:');
    console.log('   - Email: admin@tracely.app');
    console.log('   - Password: password123');
    console.log('\n   Employee:');
    console.log('   - Email: khushi@tracely.app');
    console.log('   - Password: password123');
    console.log('\n   Employee 2:');
    console.log('   - Email: john@tracely.app');
    console.log('   - Password: password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
