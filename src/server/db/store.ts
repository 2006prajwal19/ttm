import bcrypt from 'bcryptjs';

export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'traveller' | 'admin';
  phone?: string;
  avatar?: string;
  country?: string;
  emergencyContact?: string;
  travelPreferences?: string;
  dietaryRequirements?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Destination {
  _id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  startingPrice: number;
  duration: string;
  lat: number;
  lng: number;
  featured: boolean;
  climate: string;
  tags: string[];
}

export interface Tour {
  _id: string;
  title: string;
  slug: string;
  destinationId: string;
  destinationName: string;
  country: string;
  category: 'Adventure' | 'Beach' | 'Cultural' | 'Luxury' | 'Wildlife' | 'Mountain';
  images: string[];
  price: number;
  duration: string;
  groupSize: number;
  capacity: number;
  bookedCount: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  departureDates: string[];
  itinerary: { day: number; title: string; description: string; meals?: string; stay?: string }[];
  inclusions: string[];
  exclusions: string[];
  rating: number;
  reviewsCount: number;
  active: boolean;
  createdAt: string;
}

export interface Booking {
  _id: string;
  bookingReference: string;
  userId: string;
  travellerName: string;
  travellerEmail: string;
  travellerPhone: string;
  tourId: string;
  tourTitle: string;
  tourImage: string;
  destinationName: string;
  departureDate: string;
  travellerCount: number;
  unitPrice: number;
  totalPrice: number;
  bookingStatus: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  specialRequests?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  tourId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Favorite {
  _id: string;
  userId: string;
  tourId: string;
  createdAt: string;
}

export interface Newsletter {
  _id: string;
  email: string;
  createdAt: string;
}

export interface Session {
  _id: string;
  token: string;
  userId: string;
  email: string;
  role: 'traveller' | 'admin';
  name: string;
  expiresAt: number;
  createdAt: string;
}

// In-Memory Document Collections conforming to Mongoose models
class InMemoryDatabase {
  users: User[] = [];
  destinations: Destination[] = [];
  tours: Tour[] = [];
  bookings: Booking[] = [];
  reviews: Review[] = [];
  favorites: Favorite[] = [];
  newsletters: Newsletter[] = [];
  sessions: Session[] = [];

  isInitialized = false;

  constructor() {
    this.seedDefaults();
  }

  seedDefaults() {
    if (this.isInitialized) return;

    // Default Passwords hashed with bcrypt
    const travellerHash = bcrypt.hashSync('traveller123', 10);
    const adminHash = bcrypt.hashSync('admin123', 10);

    this.users = [
      {
        _id: 'usr_admin_1',
        name: 'Elena Rostova',
        email: 'admin@aetheria.travel',
        passwordHash: adminHash,
        role: 'admin',
        phone: '+1 (555) 019-2831',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        country: 'Switzerland',
        status: 'active',
        createdAt: '2026-01-10T08:00:00.000Z',
      },
      {
        _id: 'usr_traveller_1',
        name: 'Julian Vance',
        email: 'traveller@aetheria.travel',
        passwordHash: travellerHash,
        role: 'traveller',
        phone: '+1 (555) 782-9912',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        country: 'United States',
        emergencyContact: 'Sarah Vance (+1 555-782-9913)',
        travelPreferences: 'Eco-resorts, photography, high-altitude trekking',
        dietaryRequirements: 'Vegetarian, strictly no shellfish',
        status: 'active',
        createdAt: '2026-02-15T10:30:00.000Z',
      },
      {
        _id: 'usr_traveller_2',
        name: 'Aria Chen',
        email: 'aria.chen@example.com',
        passwordHash: travellerHash,
        role: 'traveller',
        phone: '+65 9123 4567',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        country: 'Singapore',
        emergencyContact: 'Ken Chen (+65 9123 8888)',
        travelPreferences: 'Heritage architecture, culinary masterclasses',
        dietaryRequirements: 'None',
        status: 'active',
        createdAt: '2026-03-01T14:10:00.000Z',
      },
    ];

    this.destinations = [
      {
        _id: 'dest_bali',
        name: 'Bali',
        country: 'Indonesia',
        description: 'Tropical paradise of sacred volcanic temples, emerald rice terraces, and world-class ocean swells.',
        image: '/src/assets/images/dest_bali_temple_1792642638723.jpg',
        startingPrice: 1290,
        duration: '7 Days',
        lat: -8.4095,
        lng: 115.1889,
        featured: true,
        climate: 'Tropical 28°C',
        tags: ['Temples', 'Beaches', 'Wellness', 'Surfing'],
      },
      {
        _id: 'dest_swiss_alps',
        name: 'Swiss Alps',
        country: 'Switzerland',
        description: 'Majestic glacier-carved peaks, iconic Matterhorn horizons, and alpine luxury chalets.',
        image: '/src/assets/images/dest_swiss_alps_1792642639766.jpg',
        startingPrice: 2450,
        duration: '8 Days',
        lat: 46.0207,
        lng: 7.7491,
        featured: true,
        climate: 'Alpine 12°C',
        tags: ['Glaciers', 'Hiking', 'Luxury Chalets', 'Scenic Rail'],
      },
      {
        _id: 'dest_kyoto',
        name: 'Kyoto',
        country: 'Japan',
        description: 'Ancient imperial capital steeped in zen gardens, bamboo sanctuaries, and centuries of tea culture.',
        image: '/src/assets/images/dest_kyoto_bamboo_1792642639795.jpg',
        startingPrice: 1890,
        duration: '6 Days',
        lat: 35.0116,
        lng: 135.7681,
        featured: true,
        climate: 'Temperate 18°C',
        tags: ['Zen Gardens', 'Culinary', 'Tea Ceremonies', 'Temples'],
      },
      {
        _id: 'dest_santorini',
        name: 'Santorini',
        country: 'Greece',
        description: 'Cliffside whitewashed villages cascading into the azure Aegean Sea under legendary golden hour sunsets.',
        image: '/src/assets/images/dest_santorini_view_1792642644829.jpg',
        startingPrice: 2150,
        duration: '6 Days',
        lat: 36.3932,
        lng: 25.4615,
        featured: true,
        climate: 'Mediterranean 26°C',
        tags: ['Caldera Views', 'Catamaran Cruise', 'Wine Tasting', 'Luxury'],
      },
      {
        _id: 'dest_dubai',
        name: 'Dubai',
        country: 'United Arab Emirates',
        description: 'Futuristic hyper-modern skyline meeting vast crimson sand dunes, fine dining, and desert luxury.',
        image: '/src/assets/images/dest_dubai_skyline_1792642640903.jpg',
        startingPrice: 1650,
        duration: '5 Days',
        lat: 25.2048,
        lng: 55.2708,
        featured: true,
        climate: 'Desert Warm 31°C',
        tags: ['Desert Safari', 'Modern Architecture', 'Luxury Marina', 'Skyline'],
      },
      {
        _id: 'dest_manali',
        name: 'Manali',
        country: 'India',
        description: 'Spellbinding Himalayan pine valley flanked by snowbound high passes, river gorges, and apple orchards.',
        image: '/src/assets/images/dest_manali_himalaya_1792642642153.jpg',
        startingPrice: 890,
        duration: '7 Days',
        lat: 32.2432,
        lng: 77.1892,
        featured: true,
        climate: 'Himalayan 14°C',
        tags: ['Himalayan Treks', 'Solang Valley', 'Rohtang Pass', 'Adventure'],
      },
    ];

    this.tours = [
      {
        _id: 'tour_bali_spiritual',
        title: 'Spiritual Bali & Island Horizons',
        slug: 'spiritual-bali-island-horizons',
        destinationId: 'dest_bali',
        destinationName: 'Bali',
        country: 'Indonesia',
        category: 'Cultural',
        images: [
          '/src/assets/images/dest_bali_temple_1792642638723.jpg',
        ],
        price: 1350,
        duration: '7 Days / 6 Nights',
        groupSize: 12,
        capacity: 16,
        bookedCount: 8,
        difficulty: 'Easy',
        departureDates: ['2026-11-15', '2026-12-05', '2027-01-20', '2027-02-14'],
        itinerary: [
          { day: 1, title: 'Arrival in Denpasar & Ubud Transfer', description: 'Private welcome at Ngurah Rai airport, check-in to jungle luxury villa in Ubud, evening welcome dinner with traditional Kecak performance.', meals: 'Dinner', stay: 'Ubud Hanging Gardens' },
          { day: 2, title: 'Ulun Danu Lake & Sacred Water Temples', description: 'Early morning private boat ride on Lake Beratan, meditation at Ulun Danu, and scenic walk through Jatiluwih UNESCO rice terraces.', meals: 'Breakfast, Lunch', stay: 'Ubud Hanging Gardens' },
          { day: 3, title: 'Mount Batur Sunrise Trek', description: 'Pre-dawn moderate climb up Mount Batur caldera to witness sunrise above the clouds, followed by volcanic hot springs soak.', meals: 'Breakfast, Picnic', stay: 'Ubud Hanging Gardens' },
          { day: 4, title: 'Transfer to Uluwatu Cliffs', description: 'Scenic drive to south coast Uluwatu, cliff-top ocean sanctuary check-in, sunset coastal photography.', meals: 'Breakfast, Dinner', stay: 'Six Senses Uluwatu' },
          { day: 5, title: 'Nusa Penida Catamaran Island Expedition', description: 'Private luxury catamaran to Kelingking T-Rex cliff and Manta Point snorkeling with giant manta rays.', meals: 'Breakfast, Lunch', stay: 'Six Senses Uluwatu' },
          { day: 6, title: 'Balinese Spa & Farewell Banquet', description: 'Traditional herbal body purification, ocean-view relaxation, and beachfront seafood feast at Jimbaran Bay.', meals: 'Breakfast, Dinner', stay: 'Six Senses Uluwatu' },
          { day: 7, title: 'Departure', description: 'Private chauffeured transfer to Denpasar International Airport.', meals: 'Breakfast' },
        ],
        inclusions: ['Luxury 5-star villa accommodations', 'Private chauffeur and daily transport', 'Daily organic breakfast & select gourmet dinners', 'Private catamaran charter to Nusa Penida', 'All temple permits and certified guide fees'],
        exclusions: ['International flights', 'Personal travel insurance', 'Discretionary tips'],
        rating: 4.9,
        reviewsCount: 38,
        active: true,
        createdAt: '2026-01-20T09:00:00.000Z',
      },
      {
        _id: 'tour_swiss_matterhorn',
        title: 'Swiss Alps Matterhorn & Glacier Express',
        slug: 'swiss-alps-matterhorn-glacier-express',
        destinationId: 'dest_swiss_alps',
        destinationName: 'Swiss Alps',
        country: 'Switzerland',
        category: 'Mountain',
        images: [
          '/src/assets/images/dest_swiss_alps_1792642639766.jpg',
        ],
        price: 2680,
        duration: '8 Days / 7 Nights',
        groupSize: 10,
        capacity: 14,
        bookedCount: 6,
        difficulty: 'Moderate',
        departureDates: ['2026-11-20', '2026-12-18', '2027-01-15', '2027-03-10'],
        itinerary: [
          { day: 1, title: 'Zurich to Zermatt Alpine Gateway', description: 'Scenic rail voyage past Lake Thun into the car-free mountain haven of Zermatt. Check-in to Alpine luxury lodge.', meals: 'Dinner', stay: 'The Omnia Zermatt' },
          { day: 2, title: 'Matterhorn Glacier Paradise (3,883m)', description: 'Ascent via highest 3S cableway in the world to Klein Matterhorn ice palace, panoramic vistas of 38 alpine peaks.', meals: 'Breakfast, Lunch', stay: 'The Omnia Zermatt' },
          { day: 3, title: 'Gornergrat Cogwheel & 5-Lakes Alpine Trail', description: 'Historic cogwheel railway to Gornergrat (3,089m) and pristine alpine walk with Matterhorn mirror reflections.', meals: 'Breakfast', stay: 'The Omnia Zermatt' },
          { day: 4, title: 'Glacier Express Excellence Class', description: 'Full-day panoramic journey across 291 bridges and 91 tunnels to St. Moritz, including 5-course regional wine-paired lunch.', meals: 'Breakfast, Gourmet Lunch, Dinner', stay: 'Badrutt\'s Palace Hotel' },
          { day: 5, title: 'Engadin Valley & Diavolezza Glacier Trek', description: 'Glacier walking guided expedition under Piz Palü, discovering ancient ice moraines and alpine geology.', meals: 'Breakfast, Lunch', stay: 'Badrutt\'s Palace Hotel' },
          { day: 6, title: 'Lake Silvaplana & Alpine Spa Indulgence', description: 'Morning lakeside walk, afternoon thermal thermal baths and panoramic cedar sauna.', meals: 'Breakfast', stay: 'Badrutt\'s Palace Hotel' },
          { day: 7, title: 'Chur Medieval Old Town & Swiss Fondue Night', description: 'Transfer to Switzerland\'s oldest town, walking tour of cobblestone alleys and authentic Gruyère fondue gala.', meals: 'Breakfast, Dinner', stay: 'Romantik Hotel Stern' },
          { day: 8, title: 'Zurich Departure', description: 'First-class Swiss Rail transfer to Zurich Airport.', meals: 'Breakfast' },
        ],
        inclusions: ['7 nights premium 5-star Swiss Alpine lodges', 'First-class Swiss Travel Rail Pass', 'Glacier Express Excellence Class seating', 'Private IFMGA-certified alpine mountain guides', 'All cableway and funicular admissions'],
        exclusions: ['International airfare', 'Ski gear rental', 'Personal expenses'],
        rating: 4.95,
        reviewsCount: 52,
        active: true,
        createdAt: '2026-02-01T11:00:00.000Z',
      },
      {
        _id: 'tour_kyoto_zen',
        title: 'Kyoto Zen Heritage & Culinary Arts',
        slug: 'kyoto-zen-heritage-culinary-arts',
        destinationId: 'dest_kyoto',
        destinationName: 'Kyoto',
        country: 'Japan',
        category: 'Cultural',
        images: [
          '/src/assets/images/dest_kyoto_bamboo_1792642639795.jpg',
        ],
        price: 1980,
        duration: '6 Days / 5 Nights',
        groupSize: 8,
        capacity: 12,
        bookedCount: 5,
        difficulty: 'Easy',
        departureDates: ['2026-11-25', '2026-12-10', '2027-02-08', '2027-03-22'],
        itinerary: [
          { day: 1, title: 'Arrival in Kyoto & Ryokan Welcome', description: 'Transfer to authentic Sukiya-style luxury Ryokan, traditional Kaiseki multi-course welcome dinner.', meals: 'Dinner', stay: 'Hiiragiya Ryokan Kyoto' },
          { day: 2, title: 'Arashiyama Bamboo Sanctuary & Private Tenryu-ji', description: 'Early morning private entry to Arashiyama bamboo grove before public hours, zen garden contemplation.', meals: 'Breakfast, Lunch', stay: 'Hiiragiya Ryokan Kyoto' },
          { day: 3, title: 'Gion Geisha District & Private Urasenke Tea Ceremony', description: 'Traditional matcha ceremony guided by an 8th-generation tea master, evening lantern walk through historic Gion.', meals: 'Breakfast, Tea, Dinner', stay: 'Hiiragiya Ryokan Kyoto' },
          { day: 4, title: 'Fushimi Inari Torii Gates & Sake Brewery Tasting', description: 'Early morning hike through thousand vermillion torii gates, afternoon tasting at historic Fushimi sake cellars.', meals: 'Breakfast, Lunch', stay: 'Hiiragiya Ryokan Kyoto' },
          { day: 5, title: 'Kinkaku-ji Golden Pavilion & Daitoku-ji Shojin Ryori', description: 'Private tour of the golden pavilion and authentic temple vegan Buddhist lunch prepared by monks.', meals: 'Breakfast, Temple Lunch', stay: 'Hiiragiya Ryokan Kyoto' },
          { day: 6, title: 'Shinkansen Transfer or Osaka Departure', description: 'Morning meditation session and private bullet train escort.', meals: 'Breakfast' },
        ],
        inclusions: ['5 nights luxury authentic Japanese Ryokan', 'Private English-speaking certified cultural master guide', 'Private Tea Master ceremony and exclusive temple entries', 'Authentic Kaiseki multi-course fine dining daily', 'Shinkansen bullet train transfers'],
        exclusions: ['International flights', 'Alcoholic beverages outside tastings'],
        rating: 4.88,
        reviewsCount: 44,
        active: true,
        createdAt: '2026-02-05T12:00:00.000Z',
      },
      {
        _id: 'tour_santorini_caldera',
        title: 'Santorini Caldera Sunset & Aegean Voyage',
        slug: 'santorini-caldera-sunset-aegean-voyage',
        destinationId: 'dest_santorini',
        destinationName: 'Santorini',
        country: 'Greece',
        category: 'Luxury',
        images: [
          '/src/assets/images/dest_santorini_view_1792642644829.jpg',
        ],
        price: 2290,
        duration: '6 Days / 5 Nights',
        groupSize: 10,
        capacity: 14,
        bookedCount: 9,
        difficulty: 'Easy',
        departureDates: ['2026-11-10', '2027-04-15', '2027-05-10', '2027-06-05'],
        itinerary: [
          { day: 1, title: 'Oia Cliffside Welcome & Infinity Pool Check-in', description: 'Private chauffeur from Thira airport to cliffside cave villa in Oia overlooking the caldera.', meals: 'Dinner', stay: 'Canaves Oia Suites' },
          { day: 2, title: 'Private Catamaran Caldera & Hot Springs Cruise', description: 'Sail past Red Beach, White Beach, and swim in volcanic thermal springs, sunset BBQ onboard.', meals: 'Breakfast, Seafood Lunch, Sunset BBQ', stay: 'Canaves Oia Suites' },
          { day: 3, title: 'Ancient Akrotiri Bronze Age Ruins & Wine Pairing', description: 'Guided excavation tour of prehistoric Minoan city, followed by Assyrtiko volcanic wine tasting at Santo Wines.', meals: 'Breakfast, Wine Pairing Lunch', stay: 'Canaves Oia Suites' },
          { day: 4, title: 'Oia to Fira Scenic Cliff Hike', description: 'Stunning 10km caldera rim walk through Imerovigli, panoramic Aegean views at every turn.', meals: 'Breakfast, Lunch', stay: 'Canaves Oia Suites' },
          { day: 5, title: 'Helicopter Aerial Tour & Michelin-Starred Gala', description: 'Breathtaking 20-minute flight over the volcanic crater, concluding with candlelit cliffside gala dinner.', meals: 'Breakfast, Gala Dinner', stay: 'Canaves Oia Suites' },
          { day: 6, title: 'Departure from Thira', description: 'Private transfer to Santorini Airport or port.', meals: 'Breakfast' },
        ],
        inclusions: ['5 nights luxury caldera-view cave suite with plunge pool', 'Private luxury catamaran day charter with fresh seafood', 'Private helicopter caldera flight', 'Volcanic winery masterclass with sommelier', 'Private Mercedes chauffeur transfers'],
        exclusions: ['International flights', 'Gratuities for crew'],
        rating: 4.97,
        reviewsCount: 61,
        active: true,
        createdAt: '2026-02-12T14:30:00.000Z',
      },
      {
        _id: 'tour_dubai_futuristic',
        title: 'Futuristic Dubai Skyline & Royal Desert Safari',
        slug: 'futuristic-dubai-skyline-royal-desert-safari',
        destinationId: 'dest_dubai',
        destinationName: 'Dubai',
        country: 'United Arab Emirates',
        category: 'Luxury',
        images: [
          '/src/assets/images/dest_dubai_skyline_1792642640903.jpg',
        ],
        price: 1750,
        duration: '5 Days / 4 Nights',
        groupSize: 12,
        capacity: 18,
        bookedCount: 11,
        difficulty: 'Easy',
        departureDates: ['2026-11-18', '2026-12-08', '2027-01-12', '2027-02-20'],
        itinerary: [
          { day: 1, title: 'VIP Airport Welcome & Downtown Luxury Suite', description: 'Rolls Royce private chauffeur to luxury downtown hotel facing Burj Khalifa.', meals: 'Dinner', stay: 'Armani Hotel Dubai' },
          { day: 2, title: 'Burj Khalifa Level 148 VIP Lounge & Museum of the Future', description: 'Fast-track access to highest observation deck in the world, followed by immersive Museum of the Future exploration.', meals: 'Breakfast, High Tea', stay: 'Armani Hotel Dubai' },
          { day: 3, title: 'Royal Desert Conservation Reserve & Dune Bashing', description: 'Vintage Land Rover safari through Dubai Desert Conservation Reserve, falconry display, and 5-course desert oasis banquet under the stars.', meals: 'Breakfast, Royal Desert Dinner', stay: 'Al Maha Desert Resort & Spa' },
          { day: 4, title: 'Dubai Marina Luxury Yacht Cruise & Palm Jumeirah', description: 'Private 3-hour yacht voyage around Atlantis The Royal, Bluewaters Island, and Ain Dubai.', meals: 'Breakfast, Gourmet Lunch', stay: 'Al Maha Desert Resort & Spa' },
          { day: 5, title: 'Departure', description: 'Chauffeured VIP airport lounge escort.', meals: 'Breakfast' },
        ],
        inclusions: ['4 nights in world-class 5-star suites', 'Burj Khalifa VIP At The Top SKY entry', 'Private royal desert camp with falconry & astronomy', 'Private 65ft luxury yacht cruise with catering', 'All luxury chauffeured limousine transfers'],
        exclusions: ['International flights', 'Personal shopping'],
        rating: 4.91,
        reviewsCount: 39,
        active: true,
        createdAt: '2026-02-18T10:00:00.000Z',
      },
      {
        _id: 'tour_manali_himalayan',
        title: 'Himalayan Ridge Trek & Solang Alpine Expedition',
        slug: 'himalayan-ridge-trek-solang-alpine-expedition',
        destinationId: 'dest_manali',
        destinationName: 'Manali',
        country: 'India',
        category: 'Adventure',
        images: [
          '/src/assets/images/dest_manali_himalaya_1792642642153.jpg',
        ],
        price: 940,
        duration: '7 Days / 6 Nights',
        groupSize: 12,
        capacity: 15,
        bookedCount: 7,
        difficulty: 'Challenging',
        departureDates: ['2026-11-05', '2027-03-15', '2027-04-10', '2027-05-01'],
        itinerary: [
          { day: 1, title: 'Kullu Valley Arrival & Manali Pine Chalet', description: 'Scenic drive along the roaring Beas River, welcome apple-cider tea, check-in to wooden Himalayan cedar chalet.', meals: 'Dinner', stay: 'The Himalayan Manali' },
          { day: 2, title: 'Solang Valley Paragliding & Jogini Waterfalls', description: 'Tandem paragliding over alpine meadows, followed by scenic pine forest trek to sacred Jogini Waterfall cascades.', meals: 'Breakfast, Packed Lunch', stay: 'The Himalayan Manali' },
          { day: 3, title: 'Atal Tunnel to Lahaul Moonscape & Sissu Glacier', description: 'Pass through the 9km high-altitude engineering marvel into Lahaul valley, visiting frozen waterfalls and Buddhist stupas.', meals: 'Breakfast, Hot Mountain Lunch', stay: 'The Himalayan Manali' },
          { day: 4, title: 'Bhrigu Lake Alpine Ridge Trek (Ascent to 4,200m)', description: 'Guided high-altitude trek through oak forests to sub-alpine grasslands, wilderness tent camping under crystalline mountain stars.', meals: 'Breakfast, Trail Rations, Campfire Dinner', stay: 'Wilderness Mountain Campsite' },
          { day: 5, title: 'Glacial Tarn Lake & Sacred Peaks', description: 'Reach mystical emerald Bhrigu Lake, breathtaking panoramic views of Pir Panjal and Dhauladhar ranges, descent to base.', meals: 'Breakfast, Lunch, Dinner', stay: 'The Himalayan Manali' },
          { day: 6, title: 'Old Manali Bohemian Cafes & Hot Springs', description: 'Visit historic Hadimba temple, soak in natural sulfur hot springs at Vashisht, artisan bazaar exploration.', meals: 'Breakfast, Himachali Feast', stay: 'The Himalayan Manali' },
          { day: 7, title: 'Departure via Kullu Airport or Chandigarh', description: 'Transfer to Kullu-Manali Airport (Bhuntar).', meals: 'Breakfast' },
        ],
        inclusions: ['5 nights luxury mountain chalet + 1 night alpine luxury tent camp', 'Certified Himalayan mountain guides and medical oxygen kits', 'All high-altitude permits and forest fees', 'All meals with authentic Himachali culinary delicacies', 'Solang Valley tandem paragliding session with certified pilot'],
        exclusions: ['Personal trekking gear (boots, thermal wear)', 'Domestic/international airfare'],
        rating: 4.93,
        reviewsCount: 31,
        active: true,
        createdAt: '2026-02-22T08:00:00.000Z',
      },
      {
        _id: 'tour_bali_surf_beach',
        title: 'Bali Surf, Coral Reefs & Secret Beaches',
        slug: 'bali-surf-coral-reefs-secret-beaches',
        destinationId: 'dest_bali',
        destinationName: 'Bali',
        country: 'Indonesia',
        category: 'Beach',
        images: [
          '/src/assets/images/dest_bali_temple_1792642638723.jpg',
        ],
        price: 1150,
        duration: '6 Days / 5 Nights',
        groupSize: 10,
        capacity: 14,
        bookedCount: 4,
        difficulty: 'Easy',
        departureDates: ['2026-11-28', '2026-12-15', '2027-01-25'],
        itinerary: [
          { day: 1, title: 'Seminyak Coastal Arrival', description: 'Private airport pickup, beachfront sunset cocktail reception.', meals: 'Dinner', stay: 'W Bali Seminyak' },
          { day: 2, title: 'Private Surf Coaching at Canggu', description: 'Morning personalized surf coaching for all skill levels with ISA certified instructors.', meals: 'Breakfast, Lunch', stay: 'W Bali Seminyak' },
          { day: 3, title: 'Menjangan Island Marine Park Snorkel', description: 'Crystal-clear wall diving and snorkeling amidst coral gardens and sea turtles.', meals: 'Breakfast, Picnic', stay: 'Plataran Menjangan' },
          { day: 4, title: 'Secret Beaches of Uluwatu', description: 'Hidden coves of Thomas Beach and Padang Padang, sunset cliff aperitifs.', meals: 'Breakfast', stay: 'Alila Villas Uluwatu' },
          { day: 5, title: 'Luxury Sunset Catamaran Cruise', description: 'Scenic coast voyage with champagne, swimming, and fresh grilled lobster dinner.', meals: 'Breakfast, Lobster Dinner', stay: 'Alila Villas Uluwatu' },
          { day: 6, title: 'Denpasar Departure', description: 'Farewell spa treatment and airport transfer.', meals: 'Breakfast' },
        ],
        inclusions: ['5 nights 5-star beachfront resorts', 'Private ISA certified surf lessons with board & rashguard', 'Marine national park boat excursion and gear', 'Sunset catamaran cruise with gourmet dining'],
        exclusions: ['International flights', 'Personal purchases'],
        rating: 4.86,
        reviewsCount: 27,
        active: true,
        createdAt: '2026-02-24T16:00:00.000Z',
      },
      {
        _id: 'tour_swiss_winter_luxury',
        title: 'Swiss Alps Winter Luxury & St. Moritz Chalets',
        slug: 'swiss-alps-winter-luxury-st-moritz',
        destinationId: 'dest_swiss_alps',
        destinationName: 'Swiss Alps',
        country: 'Switzerland',
        category: 'Luxury',
        images: [
          '/src/assets/images/dest_swiss_alps_1792642639766.jpg',
        ],
        price: 3450,
        duration: '7 Days / 6 Nights',
        groupSize: 8,
        capacity: 10,
        bookedCount: 5,
        difficulty: 'Easy',
        departureDates: ['2026-12-12', '2027-01-08', '2027-02-05'],
        itinerary: [
          { day: 1, title: 'Zurich to St. Moritz Chauffeured Transfer', description: 'Private Maybach transfer through snowy passes into iconic St. Moritz.', meals: 'Gourmet Dinner', stay: 'Kulm Hotel St. Moritz' },
          { day: 2, title: 'Corviglia Private Ski Concierge or Snowshoe Walk', description: 'Exclusive access to Olympic slopes with former World Cup ski instructor.', meals: 'Breakfast, Mountain Lunch', stay: 'Kulm Hotel St. Moritz' },
          { day: 3, title: 'Horse-Drawn Sleigh to Roseg Valley', description: 'Romantic sleigh ride into pristine snow valleys, fondue lunch in an alpine rustic refuge.', meals: 'Breakfast, Fondue Lunch', stay: 'Kulm Hotel St. Moritz' },
          { day: 4, title: 'Private Helicopter Tour of Bernina Glacier', description: 'Spectacular aerial flight around Piz Bernina and pristine blue seracs.', meals: 'Breakfast, Dinner', stay: 'Kulm Hotel St. Moritz' },
          { day: 5, title: 'Luxury Thermal Wellness & Caviar Tasting', description: 'Full day of spa treatments and private caviar masterclass.', meals: 'Breakfast, Caviar Tasting', stay: 'Kulm Hotel St. Moritz' },
          { day: 6, title: 'St. Moritz Olympic Bobsleigh Experience', description: 'Adrenaline run down the historic natural ice bobsleigh run with professional pilot.', meals: 'Breakfast, Gala Dinner', stay: 'Kulm Hotel St. Moritz' },
          { day: 7, title: 'Zurich Departure', description: 'Private chauffeur to Zurich International Airport VIP terminal.', meals: 'Breakfast' },
        ],
        inclusions: ['6 nights at the legendary Kulm Hotel', 'Private ski guide or winter experience host', 'Scenic helicopter glacier flight', 'Private horse-drawn sleigh expedition', 'Olympic ice bobsleigh run experience'],
        exclusions: ['Ski gear purchase', 'International flights'],
        rating: 4.98,
        reviewsCount: 22,
        active: true,
        createdAt: '2026-02-28T12:00:00.000Z',
      },
      {
        _id: 'tour_kyoto_culinary_kaiseki',
        title: 'Mastering Kyoto: Michelin Gastronomy & Artisans',
        slug: 'mastering-kyoto-michelin-gastronomy-artisans',
        destinationId: 'dest_kyoto',
        destinationName: 'Kyoto',
        country: 'Japan',
        category: 'Luxury',
        images: [
          '/src/assets/images/dest_kyoto_bamboo_1792642639795.jpg',
        ],
        price: 2450,
        duration: '5 Days / 4 Nights',
        groupSize: 6,
        capacity: 8,
        bookedCount: 4,
        difficulty: 'Easy',
        departureDates: ['2026-11-19', '2026-12-04', '2027-01-18'],
        itinerary: [
          { day: 1, title: 'Welcome to Kyoto & Exclusive Kaiseki Dinner', description: 'Check-in to Aman Kyoto, multi-course kaiseki dinner curated by 3-star Michelin chef.', meals: 'Dinner', stay: 'Aman Kyoto' },
          { day: 2, title: 'Nishiki Market Private Chef Tour & Knife Master', description: 'Private tour of 400-year-old culinary market with knife forging demonstration by 10th-generation blacksmith.', meals: 'Breakfast, Market Tasting', stay: 'Aman Kyoto' },
          { day: 3, title: 'Sake Distilleries of Fushimi & Soba Masterclass', description: 'Exclusive cellar access to 300-year-old sake brewer, hands-on buckwheat soba crafting.', meals: 'Breakfast, Soba Lunch', stay: 'Aman Kyoto' },
          { day: 4, title: 'Private Forest Tea Pavilion & Kyoto Pottery', description: 'Exclusive outdoor matcha ceremony in secluded cedar forest, Kintsugi pottery workshop.', meals: 'Breakfast, Kaiseki Dinner', stay: 'Aman Kyoto' },
          { day: 5, title: 'Departure', description: 'Private chauffeured transfer to Kansai Airport.', meals: 'Breakfast' },
        ],
        inclusions: ['4 nights at Aman Kyoto secret garden pavilion', 'Two 3-star Michelin kaiseki tasting experiences', 'Private culinary masterclasses and sake pairings', 'Handcrafted Japanese chef knife gift'],
        exclusions: ['International airfare'],
        rating: 4.96,
        reviewsCount: 19,
        active: true,
        createdAt: '2026-03-01T15:00:00.000Z',
      },
      {
        _id: 'tour_manali_safari_wildlife',
        title: 'Great Himalayan National Park & Wildlife Sanctuary',
        slug: 'great-himalayan-national-park-wildlife',
        destinationId: 'dest_manali',
        destinationName: 'Manali',
        country: 'India',
        category: 'Wildlife',
        images: [
          '/src/assets/images/dest_manali_himalaya_1792642642153.jpg',
        ],
        price: 1020,
        duration: '6 Days / 5 Nights',
        groupSize: 10,
        capacity: 12,
        bookedCount: 3,
        difficulty: 'Moderate',
        departureDates: ['2026-11-12', '2027-04-05', '2027-05-15'],
        itinerary: [
          { day: 1, title: 'Manali to Tirthan Valley River Sanctuary', description: 'Drive along alpine river banks, check-in to riverside boutique eco-lodge.', meals: 'Dinner', stay: 'The Tirthan Riverside Retreat' },
          { day: 2, title: 'GHNP UNESCO Buffer Zone Wildlife Trek', description: 'Spotting Western Tragopan, Himalayan monal, blue sheep with expert naturalists.', meals: 'Breakfast, Packed Lunch', stay: 'The Tirthan Riverside Retreat' },
          { day: 3, title: 'Choie Waterfall & Trout Fishing Catch-and-Release', description: 'Fly fishing in pristine alpine waters, wilderness picnic with local organic herbs.', meals: 'Breakfast, Picnic', stay: 'The Tirthan Riverside Retreat' },
          { day: 4, title: 'Jalori Pass & Serolsar Sacred Lake (3,120m)', description: 'Trek through dense oak-rhododendron forests to ancient high-altitude temple lake.', meals: 'Breakfast, Lunch', stay: 'The Tirthan Riverside Retreat' },
          { day: 5, title: 'Chehni Kothi Ancient Timber Tower & Folk Music', description: 'Explore 1,500-year-old architectural timber fort, evening Himachali flute and folk music around bonfire.', meals: 'Breakfast, Traditional Dinner', stay: 'The Tirthan Riverside Retreat' },
          { day: 6, title: 'Departure to Kullu Airport', description: 'Farewell breakfast and airport transfer.', meals: 'Breakfast' },
        ],
        inclusions: ['5 nights boutique riverside wooden lodge', 'Certified GHNP wilderness naturalists and spotters', 'Angling permits and high-end fly-fishing equipment', 'All organic locally sourced mountain meals'],
        exclusions: ['Personal trekking gear', 'Flights'],
        rating: 4.89,
        reviewsCount: 16,
        active: true,
        createdAt: '2026-03-05T10:00:00.000Z',
      },
    ];

    this.bookings = [
      {
        _id: 'bkg_101',
        bookingReference: 'AETH-98214-BALI',
        userId: 'usr_traveller_1',
        travellerName: 'Julian Vance',
        travellerEmail: 'traveller@aetheria.travel',
        travellerPhone: '+1 (555) 782-9912',
        tourId: 'tour_bali_spiritual',
        tourTitle: 'Spiritual Bali & Island Horizons',
        tourImage: '/src/assets/images/dest_bali_temple_1792642638723.jpg',
        destinationName: 'Bali, Indonesia',
        departureDate: '2026-11-15',
        travellerCount: 2,
        unitPrice: 1350,
        totalPrice: 2700,
        bookingStatus: 'Confirmed',
        paymentStatus: 'Paid',
        specialRequests: 'One vegetarian meal set requested. High floor villa preferred.',
        createdAt: '2026-03-10T14:22:00.000Z',
      },
      {
        _id: 'bkg_102',
        bookingReference: 'AETH-41908-SWISS',
        userId: 'usr_traveller_1',
        travellerName: 'Julian Vance',
        travellerEmail: 'traveller@aetheria.travel',
        travellerPhone: '+1 (555) 782-9912',
        tourId: 'tour_swiss_matterhorn',
        tourTitle: 'Swiss Alps Matterhorn & Glacier Express',
        tourImage: '/src/assets/images/dest_swiss_alps_1792642639766.jpg',
        destinationName: 'Swiss Alps, Switzerland',
        departureDate: '2026-12-18',
        travellerCount: 1,
        unitPrice: 2680,
        totalPrice: 2680,
        bookingStatus: 'Pending',
        paymentStatus: 'Pending',
        specialRequests: 'Window seat on Glacier Express requested.',
        createdAt: '2026-03-22T09:15:00.000Z',
      },
      {
        _id: 'bkg_103',
        bookingReference: 'AETH-66231-KYOTO',
        userId: 'usr_traveller_2',
        travellerName: 'Aria Chen',
        travellerEmail: 'aria.chen@example.com',
        travellerPhone: '+65 9123 4567',
        tourId: 'tour_kyoto_zen',
        tourTitle: 'Kyoto Zen Heritage & Culinary Arts',
        tourImage: '/src/assets/images/dest_kyoto_bamboo_1792642639795.jpg',
        destinationName: 'Kyoto, Japan',
        departureDate: '2026-11-25',
        travellerCount: 2,
        unitPrice: 1980,
        totalPrice: 3960,
        bookingStatus: 'Confirmed',
        paymentStatus: 'Paid',
        specialRequests: 'Celebrating 5th wedding anniversary.',
        createdAt: '2026-03-18T18:40:00.000Z',
      },
    ];

    this.reviews = [
      {
        _id: 'rev_1',
        tourId: 'tour_bali_spiritual',
        userId: 'usr_traveller_1',
        userName: 'Julian Vance',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        rating: 5,
        comment: 'An utterly transcendental journey. The sunrise atop Mount Batur followed by the peaceful waters of Ulun Danu lake gave us memories for a lifetime. Guides were stellar.',
        createdAt: '2026-02-20T16:00:00.000Z',
      },
      {
        _id: 'rev_2',
        tourId: 'tour_swiss_matterhorn',
        userId: 'usr_traveller_2',
        userName: 'Aria Chen',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        rating: 5,
        comment: 'The Glacier Express Excellence Class was pure perfection. Waking up to the Matterhorn towering above our balcony in Zermatt was awe-inspiring.',
        createdAt: '2026-01-25T11:20:00.000Z',
      },
      {
        _id: 'rev_3',
        tourId: 'tour_santorini_caldera',
        userId: 'usr_traveller_1',
        userName: 'Julian Vance',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        rating: 5,
        comment: 'Sunset over Oia from the private catamaran was the pinnacle of Mediterranean luxury. Flawless hospitality and seamless transfers.',
        createdAt: '2026-02-14T19:30:00.000Z',
      },
    ];

    this.favorites = [
      {
        _id: 'fav_1',
        userId: 'usr_traveller_1',
        tourId: 'tour_santorini_caldera',
        createdAt: '2026-03-01T12:00:00.000Z',
      },
      {
        _id: 'fav_2',
        userId: 'usr_traveller_1',
        tourId: 'tour_dubai_futuristic',
        createdAt: '2026-03-05T09:00:00.000Z',
      },
    ];

    this.newsletters = [
      {
        _id: 'nws_1',
        email: 'explorer@wanderlust.io',
        createdAt: '2026-03-01T08:00:00.000Z',
      },
    ];

    this.isInitialized = true;
  }

  // Concurrency-safe Booking Creation
  createBooking(params: {
    userId: string;
    travellerName: string;
    travellerEmail: string;
    travellerPhone: string;
    tourId: string;
    departureDate: string;
    travellerCount: number;
    specialRequests?: string;
  }): { success: boolean; booking?: Booking; error?: string } {
    const tour = this.tours.find(t => t._id === params.tourId);
    if (!tour) {
      return { success: false, error: 'Tour not found' };
    }
    if (!tour.active) {
      return { success: false, error: 'Tour is currently inactive' };
    }

    // Capacity verification
    const remainingSeats = tour.capacity - tour.bookedCount;
    if (params.travellerCount > remainingSeats) {
      return {
        success: false,
        error: `Only ${remainingSeats} seat(s) remaining for this tour. Cannot reserve ${params.travellerCount} seats.`,
      };
    }

    // Server price calculation
    const unitPrice = tour.price;
    const totalPrice = unitPrice * params.travellerCount;

    // Unique reference generator
    const randomHex = Math.floor(10000 + Math.random() * 90000);
    const destCode = tour.destinationName.substring(0, 4).toUpperCase();
    const reference = `AETH-${randomHex}-${destCode}`;

    const newBooking: Booking = {
      _id: `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bookingReference: reference,
      userId: params.userId,
      travellerName: params.travellerName,
      travellerEmail: params.travellerEmail,
      travellerPhone: params.travellerPhone,
      tourId: tour._id,
      tourTitle: tour.title,
      tourImage: tour.images[0] || '',
      destinationName: `${tour.destinationName}, ${tour.country}`,
      departureDate: params.departureDate,
      travellerCount: params.travellerCount,
      unitPrice,
      totalPrice,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      specialRequests: params.specialRequests || '',
      createdAt: new Date().toISOString(),
    };

    // Atomic update of booked count
    tour.bookedCount += params.travellerCount;
    this.bookings.unshift(newBooking);

    return { success: true, booking: newBooking };
  }

  // Cancel booking
  cancelBooking(bookingId: string, userId: string, isAdmin = false): { success: boolean; booking?: Booking; error?: string } {
    const booking = this.bookings.find(b => b._id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }
    if (!isAdmin && booking.userId !== userId) {
      return { success: false, error: 'Unauthorized to cancel this booking' };
    }
    if (booking.bookingStatus === 'Cancelled') {
      return { success: false, error: 'Booking is already cancelled' };
    }
    if (booking.bookingStatus === 'Completed') {
      return { success: false, error: 'Completed trips cannot be cancelled' };
    }

    // Release capacity back
    const tour = this.tours.find(t => t._id === booking.tourId);
    if (tour) {
      tour.bookedCount = Math.max(0, tour.bookedCount - booking.travellerCount);
    }

    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';

    return { success: true, booking };
  }

  // Database-backed Session Management (Pure MongoDB / Document Store authentication)
  createSession(user: User): string {
    const token = `aeth_sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const session: Session = {
      _id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      token,
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days TTL
      createdAt: new Date().toISOString(),
    };
    this.sessions.push(session);
    return token;
  }

  validateSession(token: string): Session | null {
    const session = this.sessions.find(s => s.token === token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      this.sessions = this.sessions.filter(s => s.token !== token);
      return null;
    }
    return session;
  }

  deleteSession(token: string): boolean {
    const prevLength = this.sessions.length;
    this.sessions = this.sessions.filter(s => s.token !== token);
    return this.sessions.length < prevLength;
  }
}

export const db = new InMemoryDatabase();
