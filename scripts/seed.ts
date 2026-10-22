/**
 * Aetheria MongoDB Cluster Seed Script
 * Run with: npm run seed or npx tsx scripts/seed.ts
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { db } from '../src/server/db/store.js';
import {
  TourModel,
  DestinationModel,
  UserModel,
  BookingModel,
} from '../src/server/db/mongoose.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aetheria';

async function runSeed() {
  console.log('--- Aetheria MongoDB Database Seeder ---');
  console.log(`Target URI: ${uri}`);

  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('✓ Connected to MongoDB');

    // Clear existing
    await Promise.all([
      DestinationModel.deleteMany({}),
      TourModel.deleteMany({}),
      UserModel.deleteMany({}),
      BookingModel.deleteMany({}),
    ]);
    console.log('✓ Cleaned existing collections in MongoDB');

    // Insert seeds
    await DestinationModel.insertMany(db.destinations);
    console.log(`✓ Seeded ${db.destinations.length} destinations into MongoDB`);

    await TourModel.insertMany(db.tours);
    console.log(`✓ Seeded ${db.tours.length} tour packages into MongoDB`);

    await UserModel.insertMany(db.users.map(u => ({ ...u, _id: undefined })));
    console.log(`✓ Seeded ${db.users.length} verified users into MongoDB`);

    await BookingModel.insertMany(db.bookings.map(b => ({ ...b, _id: undefined })));
    console.log(`✓ Seeded ${db.bookings.length} reservations into MongoDB`);

    console.log('\n[SUCCESS] MongoDB database successfully seeded!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.warn(`[Notice] Could not connect to MongoDB at ${uri}: ${err.message}`);
    console.log('Seeding in-memory/standalone storage fallback...');
    db.isInitialized = false;
    db.seedDefaults();
    console.log(`✓ Standalone storage seeded with ${db.tours.length} tours and ${db.destinations.length} destinations.`);
    process.exit(0);
  }
}

runSeed();
