import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, Tour, Destination } from '../db/store.js';
import { authenticate, requireAdmin, generateToken, AuthRequest } from '../middleware/auth.js';
import { mongoConfig } from '../db/mongoose.js';

export const apiRouter = Router();

// ==========================================
// 1. HEALTH & METADATA
// ==========================================
apiRouter.get('/health', (_req, res: Response) => {
  res.json({
    status: 'ok',
    database: mongoConfig.status,
    mongoUri: mongoConfig.uri,
    isConnectedToMongo: mongoConfig.isConnected,
    timestamp: new Date().toISOString(),
    totalTours: db.tours.length,
    totalBookings: db.bookings.length,
  });
});

apiRouter.get('/admin/system', authenticate, requireAdmin, (_req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    mongoUri: mongoConfig.uri,
    isConnected: mongoConfig.isConnected,
    status: mongoConfig.status,
    error: mongoConfig.error,
  });
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================
apiRouter.post('/auth/register', (req, res: Response) => {
  try {
    const { name, email, password, role, phone, country } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const emailNormalized = email.trim().toLowerCase();
    const existing = db.users.find(u => u.email.toLowerCase() === emailNormalized);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const assignedRole: 'traveller' | 'admin' = role === 'admin' ? 'admin' : 'traveller';

    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: emailNormalized,
      passwordHash,
      role: assignedRole,
      phone: phone || '',
      country: country || '',
      status: 'active' as const,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=00f0ff,0b132b`,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        phone: newUser.phone,
        country: newUser.country,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Registration failed due to server error.' });
  }
});

apiRouter.post('/auth/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === emailNormalized);

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email or password.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, message: 'Your account is currently suspended. Please contact support.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email or password.' });
      return;
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        country: user.country,
        emergencyContact: user.emergencyContact,
        travelPreferences: user.travelPreferences,
        dietaryRequirements: user.dietaryRequirements,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Login failed due to an internal server error.' });
  }
});

apiRouter.post('/auth/logout', authenticate, (req: AuthRequest, res: Response) => {
  if (req.token) {
    db.deleteSession(req.token);
  }
  res.json({ success: true, message: 'Successfully signed out. Session removed from database.' });
});

apiRouter.get('/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.users.find(u => u._id === req.user?.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      country: user.country,
      emergencyContact: user.emergencyContact,
      travelPreferences: user.travelPreferences,
      dietaryRequirements: user.dietaryRequirements,
      createdAt: user.createdAt,
    },
  });
});

apiRouter.put('/auth/profile', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.users.find(u => u._id === req.user?.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const { name, phone, country, emergencyContact, travelPreferences, dietaryRequirements, avatar } = req.body;
  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone;
  if (country !== undefined) user.country = country;
  if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
  if (travelPreferences !== undefined) user.travelPreferences = travelPreferences;
  if (dietaryRequirements !== undefined) user.dietaryRequirements = dietaryRequirements;
  if (avatar) user.avatar = avatar;

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      country: user.country,
      emergencyContact: user.emergencyContact,
      travelPreferences: user.travelPreferences,
      dietaryRequirements: user.dietaryRequirements,
    },
  });
});

// ==========================================
// 3. DESTINATIONS ENDPOINTS
// ==========================================
apiRouter.get('/destinations', (_req, res: Response) => {
  res.json({ success: true, count: db.destinations.length, data: db.destinations });
});

apiRouter.get('/destinations/:id', (req, res: Response) => {
  const destination = db.destinations.find(d => d._id === req.params.id);
  if (!destination) {
    res.status(404).json({ success: false, message: 'Destination not found' });
    return;
  }
  const tours = db.tours.filter(t => t.destinationId === destination._id && t.active);
  res.json({ success: true, data: { ...destination, tours } });
});

apiRouter.post('/destinations', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const { name, country, description, image, startingPrice, duration, lat, lng, climate, tags } = req.body;
  if (!name || !country || !image) {
    res.status(400).json({ success: false, message: 'Name, country, and image are required.' });
    return;
  }

  const newDest: Destination = {
    _id: `dest_${Date.now()}`,
    name,
    country,
    description: description || '',
    image,
    startingPrice: Number(startingPrice) || 999,
    duration: duration || '5 Days',
    lat: Number(lat) || 0,
    lng: Number(lng) || 0,
    featured: true,
    climate: climate || 'Pleasant',
    tags: Array.isArray(tags) ? tags : ['Travel', 'Explore'],
  };

  db.destinations.push(newDest);
  res.status(201).json({ success: true, message: 'Destination created', data: newDest });
});

apiRouter.put('/destinations/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const dest = db.destinations.find(d => d._id === req.params.id);
  if (!dest) {
    res.status(404).json({ success: false, message: 'Destination not found' });
    return;
  }

  Object.assign(dest, req.body);
  res.json({ success: true, message: 'Destination updated', data: dest });
});

apiRouter.delete('/destinations/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const index = db.destinations.findIndex(d => d._id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Destination not found' });
    return;
  }

  db.destinations.splice(index, 1);
  res.json({ success: true, message: 'Destination deleted' });
});

// ==========================================
// 4. TOURS ENDPOINTS
// ==========================================
apiRouter.get('/tours', (req, res: Response) => {
  let results = [...db.tours];

  const { category, destination, difficulty, search, minPrice, maxPrice, sort, page = '1', limit = '12' } = req.query;

  // Filter only active unless admin request
  results = results.filter(t => t.active);

  if (category && category !== 'All') {
    results = results.filter(t => t.category.toLowerCase() === String(category).toLowerCase());
  }

  if (destination && destination !== 'All') {
    results = results.filter(t => t.destinationName.toLowerCase() === String(destination).toLowerCase());
  }

  if (difficulty && difficulty !== 'All') {
    results = results.filter(t => t.difficulty.toLowerCase() === String(difficulty).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.destinationName.toLowerCase().includes(q) ||
      t.country.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    results = results.filter(t => t.price >= Number(minPrice));
  }

  if (maxPrice) {
    results = results.filter(t => t.price <= Number(maxPrice));
  }

  // Sorting
  if (sort === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'duration') {
    results.sort((a, b) => b.groupSize - a.groupSize);
  } else {
    // Default popularity / reviews
    results.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const limitNum = parseInt(String(limit), 10) || 12;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = results.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    total: results.length,
    page: pageNum,
    totalPages: Math.ceil(results.length / limitNum),
    data: paginated,
  });
});

apiRouter.get('/tours/:id', (req, res: Response) => {
  const tour = db.tours.find(t => t._id === req.params.id || t.slug === req.params.id);
  if (!tour) {
    res.status(404).json({ success: false, message: 'Tour package not found' });
    return;
  }

  const destination = db.destinations.find(d => d._id === tour.destinationId);
  const reviews = db.reviews.filter(r => r.tourId === tour._id);
  const relatedTours = db.tours
    .filter(t => t._id !== tour._id && (t.destinationId === tour.destinationId || t.category === tour.category))
    .slice(0, 3);

  res.json({
    success: true,
    data: {
      ...tour,
      destination,
      reviews,
      relatedTours,
      remainingSeats: Math.max(0, tour.capacity - tour.bookedCount),
    },
  });
});

apiRouter.post('/tours', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const {
    title,
    destinationName,
    country,
    category,
    price,
    duration,
    capacity,
    difficulty,
    departureDates,
    itinerary,
    inclusions,
    exclusions,
    images,
  } = req.body;

  if (!title || !price || !category) {
    res.status(400).json({ success: false, message: 'Title, price, and category are required.' });
    return;
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const matchingDest = db.destinations.find(d => d.name.toLowerCase() === (destinationName || '').toLowerCase());

  const newTour: Tour = {
    _id: `tour_${Date.now()}`,
    title,
    slug,
    destinationId: matchingDest ? matchingDest._id : 'dest_custom',
    destinationName: destinationName || 'Global',
    country: country || 'International',
    category: category || 'Adventure',
    images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/dest_bali_temple_1792642638723.jpg'],
    price: Number(price),
    duration: duration || '5 Days',
    groupSize: 12,
    capacity: Number(capacity) || 16,
    bookedCount: 0,
    difficulty: difficulty || 'Moderate',
    departureDates: Array.isArray(departureDates) && departureDates.length > 0 ? departureDates : ['2026-11-20', '2026-12-15'],
    itinerary: Array.isArray(itinerary) ? itinerary : [
      { day: 1, title: 'Arrival and Orientation', description: 'Meet with lead guide and settle into luxury accommodations.' },
    ],
    inclusions: Array.isArray(inclusions) ? inclusions : ['Premium accommodations', 'Daily breakfast', 'Certified guide'],
    exclusions: Array.isArray(exclusions) ? exclusions : ['International flights', 'Personal insurance'],
    rating: 5.0,
    reviewsCount: 1,
    active: true,
    createdAt: new Date().toISOString(),
  };

  db.tours.unshift(newTour);
  res.status(201).json({ success: true, message: 'Tour created successfully', data: newTour });
});

apiRouter.put('/tours/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const tour = db.tours.find(t => t._id === req.params.id);
  if (!tour) {
    res.status(404).json({ success: false, message: 'Tour not found' });
    return;
  }

  Object.assign(tour, req.body);
  res.json({ success: true, message: 'Tour updated successfully', data: tour });
});

apiRouter.delete('/tours/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const index = db.tours.findIndex(t => t._id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Tour not found' });
    return;
  }

  // Check if active bookings exist
  const hasActiveBookings = db.bookings.some(b => b.tourId === req.params.id && b.bookingStatus === 'Confirmed');
  if (hasActiveBookings) {
    // Soft deactivate instead of hard delete to preserve historical integrity
    db.tours[index].active = false;
    res.json({ success: true, message: 'Tour has active reservations; deactivated instead of permanent deletion.' });
    return;
  }

  db.tours.splice(index, 1);
  res.json({ success: true, message: 'Tour deleted successfully' });
});

// ==========================================
// 5. BOOKINGS ENDPOINTS
// ==========================================
apiRouter.post('/bookings', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { tourId, departureDate, travellerCount, travellerName, travellerEmail, travellerPhone, specialRequests } = req.body;

    if (!tourId || !departureDate || !travellerCount) {
      res.status(400).json({ success: false, message: 'Tour, departure date, and traveller count are required.' });
      return;
    }

    const count = parseInt(String(travellerCount), 10);
    if (isNaN(count) || count < 1 || count > 20) {
      res.status(400).json({ success: false, message: 'Traveller count must be between 1 and 20.' });
      return;
    }

    const result = db.createBooking({
      userId: req.user!.id,
      travellerName: travellerName || req.user!.name,
      travellerEmail: travellerEmail || req.user!.email,
      travellerPhone: travellerPhone || '',
      tourId,
      departureDate,
      travellerCount: count,
      specialRequests,
    });

    if (!result.success) {
      res.status(400).json({ success: false, message: result.error });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Booking successfully confirmed!',
      booking: result.booking,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Booking reservation failed. Please try again.' });
  }
});

apiRouter.get('/bookings/my-bookings', authenticate, (req: AuthRequest, res: Response) => {
  const userBookings = db.bookings.filter(b => b.userId === req.user!.id);
  res.json({ success: true, count: userBookings.length, data: userBookings });
});

apiRouter.get('/bookings/:id', authenticate, (req: AuthRequest, res: Response) => {
  const booking = db.bookings.find(b => b._id === req.params.id || b.bookingReference === req.params.id);
  if (!booking) {
    res.status(404).json({ success: false, message: 'Booking not found' });
    return;
  }

  // Security check: only owner or admin can view
  if (booking.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Unauthorized to view this booking record.' });
    return;
  }

  res.json({ success: true, data: booking });
});

apiRouter.patch('/bookings/:id/cancel', authenticate, (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const result = db.cancelBooking(req.params.id, req.user!.id, isAdmin);

  if (!result.success) {
    res.status(400).json({ success: false, message: result.error });
    return;
  }

  res.json({ success: true, message: 'Booking successfully cancelled.', data: result.booking });
});

// ==========================================
// 6. ADMIN DASHBOARD & MANAGEMENT
// ==========================================
apiRouter.get('/admin/dashboard', authenticate, requireAdmin, (_req: AuthRequest, res: Response) => {
  const totalTravellers = db.users.filter(u => u.role === 'traveller').length;
  const totalTours = db.tours.length;
  const totalBookings = db.bookings.length;

  const confirmedBookings = db.bookings.filter(b => b.bookingStatus === 'Confirmed').length;
  const pendingBookings = db.bookings.filter(b => b.bookingStatus === 'Pending').length;
  const cancelledBookings = db.bookings.filter(b => b.bookingStatus === 'Cancelled').length;

  // Eligible Revenue calculation: Confirmed + Completed bookings
  const revenue = db.bookings
    .filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  res.json({
    success: true,
    stats: {
      totalTravellers,
      totalTours,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      revenue,
    },
  });
});

apiRouter.get('/admin/analytics', authenticate, requireAdmin, (_req: AuthRequest, res: Response) => {
  // Monthly booking & revenue series
  const monthlyData = [
    { month: 'Jun', bookings: 14, revenue: 29400 },
    { month: 'Jul', bookings: 22, revenue: 48900 },
    { month: 'Aug', bookings: 28, revenue: 63200 },
    { month: 'Sep', bookings: 19, revenue: 41800 },
    { month: 'Oct', bookings: 31, revenue: 72400 },
    { month: 'Nov', bookings: db.bookings.length + 15, revenue: 84500 },
  ];

  // Destination popularity
  const destinationPopularity = [
    { name: 'Bali', count: 48, revenue: 64800 },
    { name: 'Swiss Alps', count: 36, revenue: 96480 },
    { name: 'Santorini', count: 32, revenue: 73280 },
    { name: 'Kyoto', count: 28, revenue: 55440 },
    { name: 'Dubai', count: 24, revenue: 42000 },
    { name: 'Manali', count: 18, revenue: 16920 },
  ];

  // Status distribution
  const statusDistribution = [
    { name: 'Confirmed', value: db.bookings.filter(b => b.bookingStatus === 'Confirmed').length + 42, color: '#00f0ff' },
    { name: 'Pending', value: db.bookings.filter(b => b.bookingStatus === 'Pending').length + 8, color: '#f59e0b' },
    { name: 'Cancelled', value: db.bookings.filter(b => b.bookingStatus === 'Cancelled').length + 4, color: '#ef4444' },
    { name: 'Completed', value: 35, color: '#10b981' },
  ];

  // Category breakdown
  const categoryBreakdown = [
    { category: 'Cultural', count: db.tours.filter(t => t.category === 'Cultural').length },
    { category: 'Luxury', count: db.tours.filter(t => t.category === 'Luxury').length },
    { category: 'Adventure', count: db.tours.filter(t => t.category === 'Adventure').length },
    { category: 'Mountain', count: db.tours.filter(t => t.category === 'Mountain').length },
    { category: 'Beach', count: db.tours.filter(t => t.category === 'Beach').length },
    { category: 'Wildlife', count: db.tours.filter(t => t.category === 'Wildlife').length },
  ];

  res.json({
    success: true,
    data: {
      monthlyData,
      destinationPopularity,
      statusDistribution,
      categoryBreakdown,
    },
  });
});

apiRouter.get('/admin/users', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const { search, role, status } = req.query;
  let users = db.users.map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    phone: u.phone,
    country: u.country,
    emergencyContact: u.emergencyContact,
    travelPreferences: u.travelPreferences,
    dietaryRequirements: u.dietaryRequirements,
    status: u.status,
    createdAt: u.createdAt,
    bookingsCount: db.bookings.filter(b => b.userId === u._id).length,
  }));

  if (role) {
    users = users.filter(u => u.role === role);
  }
  if (status) {
    users = users.filter(u => u.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  res.json({ success: true, count: users.length, data: users });
});

apiRouter.patch('/admin/users/:id/status', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const user = db.users.find(u => u._id === req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  // Prevent admin from suspending self
  if (user._id === req.user!.id) {
    res.status(400).json({ success: false, message: 'Cannot modify status of your own administrator account.' });
    return;
  }

  const { status } = req.body;
  if (status !== 'active' && status !== 'suspended') {
    res.status(400).json({ success: false, message: 'Invalid status. Must be active or suspended.' });
    return;
  }

  user.status = status;
  res.json({ success: true, message: `User status changed to ${status}`, user });
});

apiRouter.get('/admin/bookings', authenticate, requireAdmin, (_req: AuthRequest, res: Response) => {
  res.json({ success: true, count: db.bookings.length, data: db.bookings });
});

apiRouter.patch('/admin/bookings/:id/status', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const booking = db.bookings.find(b => b._id === req.params.id);
  if (!booking) {
    res.status(404).json({ success: false, message: 'Booking not found' });
    return;
  }

  const { bookingStatus, paymentStatus } = req.body;
  if (bookingStatus) {
    // If transitioning to Cancelled from Confirmed/Pending, release seat capacity
    if (bookingStatus === 'Cancelled' && booking.bookingStatus !== 'Cancelled') {
      const tour = db.tours.find(t => t._id === booking.tourId);
      if (tour) {
        tour.bookedCount = Math.max(0, tour.bookedCount - booking.travellerCount);
      }
    }
    booking.bookingStatus = bookingStatus;
  }
  if (paymentStatus) {
    booking.paymentStatus = paymentStatus;
  }

  res.json({ success: true, message: 'Booking status updated successfully', data: booking });
});

apiRouter.post('/admin/reset-seed', authenticate, requireAdmin, (_req: AuthRequest, res: Response) => {
  db.isInitialized = false;
  db.seedDefaults();
  res.json({ success: true, message: 'Database reset to verified initial state.' });
});

// ==========================================
// 7. REVIEWS ENDPOINTS
// ==========================================
apiRouter.get('/reviews/tour/:tourId', (req, res: Response) => {
  const reviews = db.reviews.filter(r => r.tourId === req.params.tourId);
  res.json({ success: true, count: reviews.length, data: reviews });
});

apiRouter.post('/reviews', authenticate, (req: AuthRequest, res: Response) => {
  const { tourId, rating, comment } = req.body;

  if (!tourId || !rating || !comment) {
    res.status(400).json({ success: false, message: 'Tour, rating, and comment are required.' });
    return;
  }

  const tour = db.tours.find(t => t._id === tourId);
  if (!tour) {
    res.status(404).json({ success: false, message: 'Tour not found' });
    return;
  }

  const newReview = {
    _id: `rev_${Date.now()}`,
    tourId,
    userId: req.user!.id,
    userName: req.user!.name,
    userAvatar: db.users.find(u => u._id === req.user!.id)?.avatar,
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);

  // Recalculate tour average rating
  const allTourReviews = db.reviews.filter(r => r.tourId === tourId);
  const avg = allTourReviews.reduce((sum, r) => sum + r.rating, 0) / allTourReviews.length;
  tour.rating = parseFloat(avg.toFixed(2));
  tour.reviewsCount = allTourReviews.length;

  res.status(201).json({ success: true, message: 'Review submitted', data: newReview });
});

apiRouter.delete('/reviews/:id', authenticate, (req: AuthRequest, res: Response) => {
  const index = db.reviews.findIndex(r => r._id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Review not found' });
    return;
  }

  const review = db.reviews[index];
  if (review.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Unauthorized to delete this review' });
    return;
  }

  db.reviews.splice(index, 1);
  res.json({ success: true, message: 'Review deleted successfully' });
});

// ==========================================
// 8. FAVORITES ENDPOINTS
// ==========================================
apiRouter.get('/favorites', authenticate, (req: AuthRequest, res: Response) => {
  const userFavorites = db.favorites.filter(f => f.userId === req.user!.id);
  const favoriteTours = userFavorites
    .map(f => db.tours.find(t => t._id === f.tourId))
    .filter(Boolean);

  res.json({ success: true, data: favoriteTours });
});

apiRouter.post('/favorites/:tourId', authenticate, (req: AuthRequest, res: Response) => {
  const { tourId } = req.params;
  const exists = db.favorites.some(f => f.userId === req.user!.id && f.tourId === tourId);

  if (exists) {
    res.json({ success: true, message: 'Tour is already in your favorites.' });
    return;
  }

  db.favorites.push({
    _id: `fav_${Date.now()}`,
    userId: req.user!.id,
    tourId,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ success: true, message: 'Tour added to favorites' });
});

apiRouter.delete('/favorites/:tourId', authenticate, (req: AuthRequest, res: Response) => {
  const { tourId } = req.params;
  const index = db.favorites.findIndex(f => f.userId === req.user!.id && f.tourId === tourId);

  if (index !== -1) {
    db.favorites.splice(index, 1);
  }

  res.json({ success: true, message: 'Tour removed from favorites' });
});

// ==========================================
// 9. NEWSLETTER SUBSCRIPTION
// ==========================================
apiRouter.post('/newsletter', (req, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400).json({ success: false, message: 'A valid email address is required.' });
    return;
  }

  const normalized = email.trim().toLowerCase();
  if (!db.newsletters.some(n => n.email === normalized)) {
    db.newsletters.push({
      _id: `nws_${Date.now()}`,
      email: normalized,
      createdAt: new Date().toISOString(),
    });
  }

  res.json({ success: true, message: 'Welcome to Aetheria Voyages! You are subscribed to our private dispatch.' });
});
