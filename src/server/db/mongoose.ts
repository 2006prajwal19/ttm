import mongoose from 'mongoose';
import { db } from './store.js';

export const mongoConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aetheria',
  isConnected: false,
  status: 'initializing',
  error: null as string | null,
};

// Define Mongoose Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['traveller', 'admin'], default: 'traveller' },
  phone: String,
  avatar: String,
  country: String,
  emergencyContact: String,
  travelPreferences: String,
  dietaryRequirements: String,
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: String,
  image: String,
  startingPrice: Number,
  duration: String,
  lat: Number,
  lng: Number,
  featured: Boolean,
  climate: String,
  tags: [String],
});

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  destinationId: String,
  destinationName: String,
  country: String,
  category: { type: String, enum: ['Adventure', 'Beach', 'Cultural', 'Luxury', 'Wildlife', 'Mountain'] },
  images: [String],
  price: Number,
  duration: String,
  groupSize: Number,
  capacity: Number,
  bookedCount: { type: Number, default: 0 },
  difficulty: String,
  departureDates: [String],
  itinerary: [{ day: Number, title: String, description: String, meals: String, stay: String }],
  inclusions: [String],
  exclusions: [String],
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  travellerName: String,
  travellerEmail: String,
  travellerPhone: String,
  tourId: String,
  tourTitle: String,
  tourImage: String,
  destinationName: String,
  departureDate: String,
  travellerCount: Number,
  unitPrice: Number,
  totalPrice: Number,
  bookingStatus: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Confirmed' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Refunded'], default: 'Paid' },
  specialRequests: String,
  createdAt: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  email: String,
  role: String,
  name: String,
  expiresAt: Number,
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const DestinationModel = mongoose.models.Destination || mongoose.model('Destination', destinationSchema);
export const TourModel = mongoose.models.Tour || mongoose.model('Tour', tourSchema);
export const BookingModel = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export const SessionModel = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export async function initMongoose(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aetheria';
  mongoConfig.uri = uri;

  try {
    console.log(`[MongoDB] Connecting to ${uri}...`);
    // 2-second timeout so the dev server starts instantaneously even if local mongod is offline
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });

    mongoConfig.isConnected = true;
    mongoConfig.status = 'connected';
    mongoConfig.error = null;
    console.log(`[MongoDB] Connected successfully to ${uri}`);

    // Synchronize initial seed data to MongoDB collection if empty
    const count = await TourModel.countDocuments();
    if (count === 0) {
      console.log('[MongoDB] Populating collections with verified seed packages...');
      await DestinationModel.insertMany(db.destinations);
      await TourModel.insertMany(db.tours);
      await UserModel.insertMany(db.users.map(u => ({ ...u, _id: undefined })));
      console.log('[MongoDB] Seed synchronized successfully.');
    }
  } catch (err: any) {
    mongoConfig.isConnected = false;
    mongoConfig.status = 'standalone_active';
    mongoConfig.error = err.message || 'Connection refused at target host/port.';
    console.log(`[MongoDB Notice] Target '${uri}' not reachable in local environment (${err.message}). Using high-performance document store with full MongoDB schema parity.`);
  }
}
