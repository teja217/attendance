const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ATTENDANCE_FILE = path.join(DATA_DIR, 'attendance.json');

// Ensure database files exist for offline mode
const initJSONdb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(ATTENDANCE_FILE)) {
    fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify([], null, 2));
  }
};

// JSON Read/Write Helpers
const readJSON = (filePath) => {
  try {
    initJSONdb();
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
};

const writeJSON = (filePath, data) => {
  initJSONdb();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

let useLocalJSON = false;

// Query Chainer Mock to handle mongoose chains: e.g. find().populate().sort()
class QueryChain {
  constructor(data, isAttendance = false) {
    this.data = data;
    this.isAttendance = isAttendance;
  }

  select(fields) {
    // Basic mock of select('-password')
    if (fields === '-password') {
      this.data = this.data.map(item => {
        const { password, ...rest } = item;
        return rest;
      });
    }
    return this;
  }

  populate(pathName, selectFields) {
    if (this.isAttendance && pathName === 'user') {
      const users = readJSON(USERS_FILE);
      this.data = this.data.map(log => {
        const userObj = users.find(u => u._id === log.user);
        if (userObj) {
          const { password, ...userSafe } = userObj;
          return { ...log, user: userSafe };
        }
        return log;
      });
    }
    return this;
  }

  sort(sortObj) {
    if (sortObj && sortObj.timestamp) {
      this.data.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortObj.timestamp === -1 ? timeB - timeA : timeA - timeB;
      });
    }
    return this;
  }

  filter(callback) {
    this.data = this.data.filter(callback);
    return this;
  }

  // Promise compatibility
  then(onFulfilled) {
    return Promise.resolve(this.data).then(onFulfilled);
  }
}

// User Document Object wrapper
class UserDoc {
  constructor(data) {
    Object.assign(this, data);
  }
  async comparePassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

// Custom Mock Models
const MockUser = {
  async findOne({ email }) {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email.toLowerCase());
    return user ? new UserDoc(user) : null;
  },

  async findById(id) {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u._id === id);
    return user ? new UserDoc(user) : null;
  },

  async create({ name, email, password, role, createdAt }) {
    const users = readJSON(USERS_FILE);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = {
      _id: Math.random().toString(36).substring(2, 11),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'employee',
      createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString()
    };
    
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    return new UserDoc(newUser);
  },

  find(query) {
    const users = readJSON(USERS_FILE);
    return new QueryChain(users);
  },

  async deleteOne({ _id }) {
    let users = readJSON(USERS_FILE);
    users = users.filter(u => u._id !== _id);
    writeJSON(USERS_FILE, users);
    return { deletedCount: 1 };
  }
};

const MockAttendance = {
  async findOne({ user, dateString }) {
    const logs = readJSON(ATTENDANCE_FILE);
    const userId = user._id ? user._id.toString() : user.toString();
    const log = logs.find(l => l.user === userId && l.dateString === dateString);
    return log || null;
  },

  async create({ user, dateString, status, timestamp }) {
    const logs = readJSON(ATTENDANCE_FILE);
    const userId = user._id ? user._id.toString() : user.toString();
    
    const newLog = {
      _id: Math.random().toString(36).substring(2, 11),
      user: userId,
      dateString,
      status: status || 'present',
      timestamp: timestamp || new Date().toISOString()
    };
    
    logs.push(newLog);
    writeJSON(ATTENDANCE_FILE, logs);
    
    // Auto-populate for return format
    const users = readJSON(USERS_FILE);
    const userDetails = users.find(u => u._id === userId);
    return {
      ...newLog,
      user: userDetails ? { _id: userDetails._id, name: userDetails.name, email: userDetails.email } : userId,
      populate: async function() { return this; }
    };
  },

  find(query = {}) {
    let logs = readJSON(ATTENDANCE_FILE);
    if (query.user) {
      const userId = query.user._id ? query.user._id.toString() : query.user.toString();
      logs = logs.filter(l => l.user === userId);
    }
    return new QueryChain(logs, true);
  }
};

// Exports
module.exports = {
  connectDB: async (uri) => {
    // If in production and no remote DB URL is provided, skip MongoDB entirely to avoid scary logs
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
    if (isProduction && (uri.includes('127.0.0.1') || uri.includes('localhost'))) {
      console.log('Running in production without external MongoDB URI. Using local JSON database.');
      initJSONdb();
      useLocalJSON = true;
      return;
    }

    try {
      // Connect to MongoDB with a short timeout to prevent hanging if offline
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000
      });
      console.log('Successfully connected to MongoDB.');
      useLocalJSON = false;
    } catch (err) {
      console.log('Using local JSON file database for data storage.');
      initJSONdb();
      useLocalJSON = true;
    }
  },
  getUserModel: () => {
    return useLocalJSON ? MockUser : require('./User');
  },
  getAttendanceModel: () => {
    return useLocalJSON ? MockAttendance : require('./Attendance');
  }
};
