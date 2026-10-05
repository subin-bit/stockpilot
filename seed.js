// seed.js — Database Seed Script for StockPilot
// Usage: npm run seed

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Supplier = require('./models/Supplier');
const Item = require('./models/Item');
const StockTransaction = require('./models/StockTransaction');

const seedDatabase = async () => {
  console.log('====================================================');
  console.log('🌱 Starting StockPilot Database Seeder...');
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
      Supplier.deleteMany({}),
      Item.deleteMany({}),
      StockTransaction.deleteMany({})
    ]);
    console.log('✓ Cleared Users, Suppliers, Items, and StockTransactions');

    // 2. Create Default Admin User
    console.log('→ Creating default administrator account...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@stockpilot.io',
      password: 'password123' // Hashed by User model pre-save hook
    });
    console.log(`✓ Admin user created: ${adminUser.email} (Password: password123)`);

    // 3. Create Suppliers
    console.log('→ Creating suppliers...');
    const suppliers = await Supplier.insertMany([
      {
        name: 'Apex Logistics & Hardware',
        email: 'supply@apexlogistics.com',
        phone: '+1 (312) 555-0192',
        address: '100 Industrial Pkwy, Chicago, IL 60607'
      },
      {
        name: 'NexGen Component Supply',
        email: 'orders@nexgensupply.io',
        phone: '+1 (512) 555-0144',
        address: '404 Silicon Blvd, Suite 200, Austin, TX 78701'
      },
      {
        name: 'Global Office & Workspace Solutions',
        email: 'accounts@globaloffice.com',
        phone: '+1 (617) 555-0178',
        address: '12 Commercial Way, Boston, MA 02110'
      }
    ]);
    console.log(`✓ Seeded ${suppliers.length} suppliers`);

    // Map supplier IDs for convenience
    const [apex, nexgen, globalOffice] = suppliers;

    // 4. Create Items across categories (including 4 low-stock items)
    console.log('→ Creating inventory catalog items...');
    const itemsData = [
      {
        name: 'Mechanical Gaming Keyboard',
        sku: 'KB-MECH-01',
        category: 'Electronics',
        unitPrice: 89.99,
        quantity: 2,
        reorderLevel: 5,
        supplier: nexgen._id,
        createdBy: adminUser._id,
        description: '<p>Professional mechanical keyboard equipped with tactile blue switches and per-key RGB backlighting.</p>'
      },
      {
        name: 'Ergonomic Vertical Mouse',
        sku: 'MS-VERT-02',
        category: 'Peripherals',
        unitPrice: 34.50,
        quantity: 1,
        reorderLevel: 4,
        supplier: nexgen._id,
        createdBy: adminUser._id,
        description: '<p>Handshake-grip ergonomic mouse designed to minimize wrist strain and repetitive stress during long shifts.</p>'
      },
      {
        name: 'Thermal Receipt & Label Printer',
        sku: 'PR-THERM-03',
        category: 'Electronics',
        unitPrice: 129.00,
        quantity: 0,
        reorderLevel: 3,
        supplier: apex._id,
        createdBy: adminUser._id,
        description: '<p>High-speed direct thermal barcode and shipping label printer compatible with standard 4x6 labels.</p>'
      },
      {
        name: 'Dual-Motor Electric Standing Desk',
        sku: 'DSK-STAND-04',
        category: 'Furniture',
        unitPrice: 399.00,
        quantity: 6,
        reorderLevel: 2,
        supplier: globalOffice._id,
        createdBy: adminUser._id,
        description: '<p>Adjustable height standing desk with dual synchronous motors, memory presets, and anti-collision sensor.</p>'
      },
      {
        name: 'Ergonomic Breathable Mesh Chair',
        sku: 'CHR-MESH-05',
        category: 'Furniture',
        unitPrice: 199.99,
        quantity: 12,
        reorderLevel: 4,
        supplier: globalOffice._id,
        createdBy: adminUser._id,
        description: '<p>High-back ergonomic mesh office chair with adjustable 3D armrests and dynamic lumbar support.</p>'
      },
      {
        name: 'Heavy-Duty Bubble Cushioning 500m',
        sku: 'PKG-BUB-06',
        category: 'Packaging',
        unitPrice: 42.00,
        quantity: 25,
        reorderLevel: 10,
        supplier: apex._id,
        createdBy: adminUser._id,
        description: '<p>Cross-perforated protective bubble cushioning rolls suitable for fragile product packaging and freight dispatch.</p>'
      },
      {
        name: 'Corrugated Shipping Boxes (Pack of 50)',
        sku: 'PKG-BOX-07',
        category: 'Packaging',
        unitPrice: 55.00,
        quantity: 3,
        reorderLevel: 8,
        supplier: apex._id,
        createdBy: adminUser._id,
        description: '<p>Standard size corrugated cardboard cartons tested for 200 lb burst strength.</p>'
      },
      {
        name: 'Smooth Gel Ink Pens 0.7mm (Box of 24)',
        sku: 'OFC-PEN-08',
        category: 'Office Supplies',
        unitPrice: 18.50,
        quantity: 60,
        reorderLevel: 15,
        supplier: globalOffice._id,
        createdBy: adminUser._id,
        description: '<p>Quick-drying, smear-resistant black gel pens designed for warehouse documentation and paperwork.</p>'
      },
      {
        name: 'Multi-Purpose Copy Paper 20lb (5 Reams)',
        sku: 'OFC-PPR-09',
        category: 'Office Supplies',
        unitPrice: 32.00,
        quantity: 45,
        reorderLevel: 12,
        supplier: globalOffice._id,
        createdBy: adminUser._id,
        description: '<p>Acid-free 92 brightness multi-purpose copy and printer paper for invoices and packaging slips.</p>'
      },
      {
        name: 'USB-C Multiport Adapter 8-in-1 Hub',
        sku: 'HUB-USBC-10',
        category: 'Peripherals',
        unitPrice: 49.99,
        quantity: 16,
        reorderLevel: 5,
        supplier: nexgen._id,
        createdBy: adminUser._id,
        description: '<p>Aluminum multiport adapter featuring 4K HDMI, Gigabit Ethernet, 100W Power Delivery, and USB 3.0 ports.</p>'
      },
      {
        name: 'Wireless 2D Handheld Barcode Scanner',
        sku: 'SCN-BAR-11',
        category: 'Electronics',
        unitPrice: 79.50,
        quantity: 14,
        reorderLevel: 5,
        supplier: apex._id,
        createdBy: adminUser._id,
        description: '<p>Bluetooth and 2.4GHz wireless barcode reader capable of scanning damaged or reflective 1D/2D codes.</p>'
      },
      {
        name: 'Noise-Cancelling Wireless Headset',
        sku: 'AUD-HDST-12',
        category: 'Electronics',
        unitPrice: 119.00,
        quantity: 8,
        reorderLevel: 4,
        supplier: nexgen._id,
        createdBy: adminUser._id,
        description: '<p>Comfortable over-ear headset with AI-powered background noise cancellation microphone for dispatch calls.</p>'
      }
    ];

    const createdItems = await Item.insertMany(itemsData);
    console.log(`✓ Seeded ${createdItems.length} inventory items (4 low-stock / critical)`);

    // 5. Create Realistic Initial Stock Transactions
    console.log('→ Recording audit stock movement transactions...');
    const transactionsData = [
      {
        item: createdItems[0]._id, // Mechanical Keyboard
        type: 'IN',
        quantity: 10,
        note: 'Initial vendor receiving PO-1001',
        user: adminUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 days ago
      },
      {
        item: createdItems[0]._id, // Mechanical Keyboard
        type: 'OUT',
        quantity: 8,
        note: 'Customer order shipment SO-5520',
        user: adminUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        item: createdItems[1]._id, // Vertical Mouse
        type: 'IN',
        quantity: 5,
        note: 'Bulk restocking batch',
        user: adminUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18)
      },
      {
        item: createdItems[1]._id, // Vertical Mouse
        type: 'OUT',
        quantity: 4,
        note: 'Direct office hardware dispatch',
        user: adminUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
      },
      {
        item: createdItems[3]._id, // Standing Desk
        type: 'IN',
        quantity: 6,
        note: 'Container delivery receiving dock B',
        user: adminUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
      },
      {
        item: createdItems[6]._id, // Corrugated Shipping Boxes
        type: 'OUT',
        quantity: 12,
        note: 'Warehouse packout consumption',
        user: adminUser._id,
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
      }
    ];

    const createdTransactions = await StockTransaction.insertMany(transactionsData);
    console.log(`✓ Seeded ${createdTransactions.length} stock transactions`);

    console.log('====================================================');
    console.log('✅ StockPilot Database Seeded Successfully!');
    console.log('====================================================');
    console.log('🔑 Admin Login Credentials:');
    console.log('   Email:    admin@stockpilot.io');
    console.log('   Password: password123');
    console.log('📦 Total Items:        ', createdItems.length);
    console.log('⚠️ Low-Stock Items:    ', createdItems.filter(i => i.quantity <= i.reorderLevel).length);
    console.log('🏭 Total Suppliers:    ', suppliers.length);
    console.log('🔄 Total Transactions: ', createdTransactions.length);
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
