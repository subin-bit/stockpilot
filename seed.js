// seed.js — Database Seed Script for StockPilot MVP
// Usage: npm run seed

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const StockTransaction = require('./models/StockTransaction');

const seedDatabase = async () => {
  console.log('====================================================');
  console.log('🌱 Starting StockPilot MVP Database Seeder...');
  console.log('====================================================');

  if (!process.env.MONGO_URI) {
    console.error('❌ Error: MONGO_URI is not set in environment or .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // 1. Reset collections for clean idempotent seed
    console.log('→ Clearing existing data collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      StockTransaction.deleteMany({})
    ]);
    console.log('✓ Cleared Users, Categories, Products, and StockTransactions');

    // 2. Create Default Accounts (Admin & Standard User)
    console.log('→ Creating default accounts (Admin and Staff User)...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@stockpilot.io',
      password: 'password123',
      role: 'admin'
    });

    const standardUser = await User.create({
      name: 'Warehouse Operator',
      email: 'user@stockpilot.io',
      password: 'password123',
      role: 'user'
    });
    console.log(`✓ Admin created: ${adminUser.email} (Password: password123, Role: admin)`);
    console.log(`✓ Staff created: ${standardUser.email} (Password: password123, Role: user)`);

    // 3. Create Categories
    console.log('→ Creating product categories...');
    const categories = await Category.insertMany([
      { name: 'Electronics', description: 'Computing devices, printers, and barcode peripherals' },
      { name: 'Office Supplies', description: 'Paper reams, stationery, and desk accessories' },
      { name: 'Furniture', description: 'Ergonomic chairs, electric standing desks, and storage' },
      { name: 'Packaging', description: 'Carton boxes, protective bubble cushioning, and mailers' },
      { name: 'Networking', description: 'Ethernet cables, gigabit switches, and server patch cords' }
    ]);
    console.log(`✓ Created ${categories.length} categories`);

    const [electronics, office, furniture, packaging, networking] = categories;

    // 4. Create Products
    console.log('→ Creating catalog products (in-stock, low-stock, and out-of-stock)...');
    const productsData = [
      {
        name: 'Mechanical Gaming Keyboard',
        sku: 'KB-MECH-01',
        category: electronics._id,
        price: 89.99,
        quantity: 2,
        minStock: 5,
        createdBy: adminUser._id
      },
      {
        name: 'Thermal Receipt & Label Printer',
        sku: 'PR-THERM-03',
        category: electronics._id,
        price: 129.00,
        quantity: 0,
        minStock: 3,
        createdBy: adminUser._id
      },
      {
        name: 'Ergonomic Vertical Mouse',
        sku: 'MS-VERT-02',
        category: electronics._id,
        price: 34.50,
        quantity: 1,
        minStock: 4,
        createdBy: adminUser._id
      },
      {
        name: 'Dual-Motor Electric Standing Desk',
        sku: 'DSK-STAND-04',
        category: furniture._id,
        price: 399.00,
        quantity: 8,
        minStock: 2,
        createdBy: adminUser._id
      },
      {
        name: 'Ergonomic Breathable Mesh Chair',
        sku: 'CHR-MESH-05',
        category: furniture._id,
        price: 199.99,
        quantity: 14,
        minStock: 4,
        createdBy: adminUser._id
      },
      {
        name: 'Heavy-Duty Bubble Cushioning 500m',
        sku: 'PKG-BUB-06',
        category: packaging._id,
        price: 42.00,
        quantity: 25,
        minStock: 10,
        createdBy: adminUser._id
      },
      {
        name: 'Corrugated Shipping Boxes (Pack of 50)',
        sku: 'PKG-BOX-07',
        category: packaging._id,
        price: 55.00,
        quantity: 3,
        minStock: 8,
        createdBy: adminUser._id
      },
      {
        name: 'Multi-Purpose Copy Paper 20lb (5 Reams)',
        sku: 'OFC-PPR-09',
        category: office._id,
        price: 32.00,
        quantity: 45,
        minStock: 12,
        createdBy: adminUser._id
      },
      {
        name: 'Smooth Gel Ink Pens (Pack of 24)',
        sku: 'OFC-PEN-08',
        category: office._id,
        price: 18.50,
        quantity: 50,
        minStock: 15,
        createdBy: adminUser._id
      },
      {
        name: 'USB-C Multiport 8-in-1 Hub',
        sku: 'HUB-USBC-10',
        category: electronics._id,
        price: 49.99,
        quantity: 16,
        minStock: 5,
        createdBy: adminUser._id
      },
      {
        name: 'Cat6 Shielded Patch Cable 50ft',
        sku: 'NET-CAT6-12',
        category: networking._id,
        price: 19.99,
        quantity: 35,
        minStock: 8,
        createdBy: adminUser._id
      },
      {
        name: '24-Port Gigabit Managed Switch',
        sku: 'NET-SW24-13',
        category: networking._id,
        price: 189.00,
        quantity: 6,
        minStock: 2,
        createdBy: adminUser._id
      }
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`✓ Seeded ${createdProducts.length} inventory products`);

    // 5. Create Initial Stock Movement Transactions
    console.log('→ Logging initial audit stock movements...');
    const transactionsData = [
      {
        product: createdProducts[0]._id, // Keyboard
        type: 'IN',
        quantity: 10,
        note: 'Initial procurement delivery PO-1001',
        user: adminUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
      },
      {
        product: createdProducts[0]._id, // Keyboard
        type: 'OUT',
        quantity: 8,
        note: 'Customer order shipment SO-5520',
        user: standardUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        product: createdProducts[2]._id, // Mouse
        type: 'IN',
        quantity: 5,
        note: 'Batch replenishment receiving dock',
        user: adminUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18)
      },
      {
        product: createdProducts[2]._id, // Mouse
        type: 'OUT',
        quantity: 4,
        note: 'Internal hardware provisioning',
        user: standardUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
      },
      {
        product: createdProducts[3]._id, // Desk
        type: 'IN',
        quantity: 8,
        note: 'Freight container delivery dock B',
        user: adminUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
      },
      {
        product: createdProducts[6]._id, // Shipping Boxes
        type: 'OUT',
        quantity: 15,
        note: 'Dispatch fulfillment packing usage',
        user: standardUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      }
    ];

    const createdTransactions = await StockTransaction.insertMany(transactionsData);
    console.log(`✓ Seeded ${createdTransactions.length} stock transactions`);

    console.log('====================================================');
    console.log('✅ StockPilot MVP Database Seeded Successfully!');
    console.log('====================================================');
    console.log('🔑 Demo Credentials:');
    console.log('   👑 Admin: admin@stockpilot.io | Password: password123');
    console.log('   👤 Staff: user@stockpilot.io  | Password: password123');
    console.log('📦 Total Products:     ', createdProducts.length);
    console.log('🏷️ Categories:         ', categories.length);
    console.log('⚠️ Low-Stock Items:    ', createdProducts.filter(p => p.quantity <= p.minStock && p.quantity > 0).length);
    console.log('🚫 Out-of-Stock Items: ', createdProducts.filter(p => p.quantity === 0).length);
    console.log('🔄 Transactions:       ', createdTransactions.length);
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
