backend/src/utils/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FineCategory = require('../models/FineCategory');
const connectDB = require('../config/database');

const fineCategories = [
  { categoryId: 'TF001', name: 'Speeding',        description: 'Exceeding the speed limit',                      amount: 2500,  points: 5  },
  { categoryId: 'TF002', name: 'Signal Violation', description: 'Jumping red signal or traffic light',            amount: 2000,  points: 4  },
  { categoryId: 'TF003', name: 'No Helmet',        description: 'Riding motorcycle without helmet',               amount: 1500,  points: 3  },
  { categoryId: 'TF004', name: 'No Seat Belt',     description: 'Driving without seat belt',                      amount: 1500,  points: 3  },
  { categoryId: 'TF005', name: 'Drunk Driving',    description: 'Driving under influence of alcohol',             amount: 10000, points: 10 },
  { categoryId: 'TF006', name: 'Overloading',      description: 'Vehicle overloaded beyond capacity',             amount: 3000,  points: 4  },
  { categoryId: 'TF007', name: 'No License',       description: 'Driving without a valid license',                amount: 5000,  points: 8  },
  { categoryId: 'TF008', name: 'Wrong Parking',    description: 'Parking in unauthorized areas',                  amount: 1000,  points: 2  },
  { categoryId: 'TF009', name: 'Mobile Phone Use', description: 'Using mobile phone while driving',               amount: 2000,  points: 4  },
  { categoryId: 'TF010', name: 'Reckless Driving', description: 'Driving in a reckless or dangerous manner',      amount: 5000,  points: 7  },
];

const users = [
  { name: 'Admin User',           email: 'admin@police.lk',          password: 'admin123',   role: 'admin',   phone: '+94711234567', district: 'Colombo'  },
  { name: 'Officer Kamal Perera', email: 'kamal.perera@police.lk',   password: 'officer123', role: 'officer', badgeNumber: 'SLP-001', phone: '+94712345678', district: 'Colombo'  },
  { name: 'Officer Saman Silva',  email: 'saman.silva@police.lk',    password: 'officer123', role: 'officer', badgeNumber: 'SLP-002', phone: '+94713456789', district: 'Gampaha'  },
];

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');
  await User.deleteMany();
  await FineCategory.deleteMany();
  await FineCategory.insertMany(fineCategories);
  console.log(`✅ Inserted ${fineCategories.length} fine categories`);
  for (const userData of users) { await User.create(userData); }
  console.log(`✅ Inserted ${users.length} users`);
  console.log('\n📋 Login Credentials:');
  console.log('Admin    → admin@police.lk / admin123');
  console.log('Officer1 → kamal.perera@police.lk / officer123');
  console.log('Officer2 → saman.silva@police.lk / officer123');
  mongoose.disconnect();
  console.log('\n✅ Seeding complete!');
};

seed().catch((err) => { console.error(err); process.exit(1); });