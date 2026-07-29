const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getUserModel, getAttendanceModel } = require('./models/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/attendance', require('./routes/attendance'));

const path = require('path');

// Serve frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('/api', (req, res) => {
  res.send('Attendance System API is running with RINL custom theme and seeding.');
});

// Catch-all to serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance';

// Helper to generate dates from July 3rd, 2026 to July 29th, 2026
const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  while (start <= end) {
    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    start.setDate(start.getDate() + 1);
  }
  return dates;
};

const seedData = async () => {
  try {
    const User = getUserModel();
    const Attendance = getAttendanceModel();

    console.log('Checking RINL demo seed data status...');
    
    // 1. Check/Seed Admin
    let admin = await User.findOne({ email: 'admin@attendance.com' });
    if (!admin) {
      console.log('Seeding Admin account...');
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@attendance.com',
        password: 'adminpassword123',
        role: 'admin'
      });
    }

    // List of employees to seed
    const employeesToSeed = [
      { name: 'Rahul Sharma', email: 'rahul@company.com', password: 'employee123' },
      { name: 'Priya Patel', email: 'priya@company.com', password: 'employee123' },
      { name: 'Amit Verma', email: 'amit@company.com', password: 'employee123' },
      { name: 'Sneha Reddy', email: 'sneha@company.com', password: 'employee123' },
      { name: 'Vikram Singh', email: 'vikram@company.com', password: 'employee123' }
    ];

    const seededEmployees = [];

    // 2. Seed Employees
    for (const empInfo of employeesToSeed) {
      let emp = await User.findOne({ email: empInfo.email });
      if (!emp) {
        console.log(`Seeding employee: ${empInfo.name}`);
        // Set creation date back to July 1st, 2026 so they are already employed
        emp = await User.create({
          name: empInfo.name,
          email: empInfo.email,
          password: empInfo.password,
          role: 'employee',
          createdAt: new Date('2026-07-01T08:00:00Z')
        });
      }
      seededEmployees.push(emp);
    }

    // 3. Seed Attendance History from July 3rd, 2026 to July 29th, 2026
    const startDate = '2026-07-03';
    const endDate = '2026-07-29';
    const dates = getDatesInRange(startDate, endDate);

    // Only seed attendance if history is empty (to prevent seeding duplicates)
    const logsCount = await Attendance.find({});
    if (logsCount.length === 0) {
      console.log(`Seeding history from ${startDate} to ${endDate}...`);
      
      for (const emp of seededEmployees) {
        for (const dateStr of dates) {
          const dateObj = new Date(dateStr);
          const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          // Skip weekends (usually no work, keeps calendar clean)
          if (isWeekend) continue;

          const isToday = dateStr === endDate;
          
          // Seed with 85% attendance rate for past weekdays
          const shouldBePresent = isToday ? Math.random() > 0.4 : Math.random() > 0.15;

          if (shouldBePresent) {
            // Check-in timestamp (randomly between 8:45 AM and 9:30 AM)
            const checkInHour = 8 + (Math.random() > 0.6 ? 1 : 0);
            const checkInMinute = Math.floor(Math.random() * 45) + (checkInHour === 8 ? 45 : 0);
            
            const checkInTime = new Date(dateStr);
            checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

            await Attendance.create({
              user: emp._id,
              dateString: dateStr,
              status: 'present',
              timestamp: checkInTime
            });
          }
        }
      }
      console.log('Seeded complete attendance logs database successfully!');
    }

    console.log('--- RINL SEED DATA READY ---');
    console.log('Admin Account: admin@attendance.com / adminpassword123');
    console.log('All 5 seeded employees use password: employee123');
    console.log('Emails: rahul@company.com, priya@company.com, amit@company.com, sneha@company.com, vikram@company.com');
    console.log('----------------------------');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Initialize server after connection
connectDB(MONGO_URI).then(async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
