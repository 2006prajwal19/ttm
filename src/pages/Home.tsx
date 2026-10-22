import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobeHeroScene, GlobeDestination } from '../components/three/GlobeHeroScene.js';
import { BookingModal, TourForBooking } from '../components/booking/BookingModal.js';
import {
  Compass,
  Calendar,
  Users,
  Search,
  Star,
  Shield,
  Clock,
  Sparkles,
  ChevronDown,
  ArrowRight,
  MapPin,
  Check,
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Search Bar State
  const [searchDest, setSearchDest] = useState('');
  const [searchDate, setSearchDate] = useState('2026-11-15');
  const [searchTravellers, setSearchTravellers] = useState(2);
  const [searchBudget, setSearchBudget] = useState('All');

  // 3D Globe Selected Pin
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  // Active category filter for Popular Tours
  const [tourCategory, setTourCategory] = useState<string>('All');

  // Booking Modal State
  const [activeBookingTour, setActiveBookingTour] = useState<TourForBooking | null>(null);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchDest) query.set('destination', searchDest);
    if (searchDate) query.set('date', searchDate);
    if (searchBudget !== 'All') query.set('maxPrice', searchBudget);
    navigate(`/tours?${query.toString()}`);
  };

  const handleGlobeSelect = (dest: GlobeDestination) => {
    setSelectedPinId(dest.id);
  };

  const featuredDestinations = [
    {
      id: 'dest_bali',
      name: 'Bali',
      country: 'Indonesia',
      description: 'Sacred water temples, dramatic coastal cliffs, and lush emerald terraces.',
      startingPrice: 1290,
      duration: '7 Days',
      image: '/src/assets/images/dest_bali_temple_1792642638723.jpg',
      tourId: 'tour_bali_spiritual',
    },
    {
      id: 'dest_swiss_alps',
      name: 'Swiss Alps',
      country: 'Switzerland',
      description: 'Pristine glacier peaks, iconic Matterhorn views, and alpine excellence trains.',
      startingPrice: 2450,
      duration: '8 Days',
      image: '/src/assets/images/dest_swiss_alps_1792642639766.jpg',
      tourId: 'tour_swiss_matterhorn',
    },
    {
      id: 'dest_kyoto',
      name: 'Kyoto',
      country: 'Japan',
      description: 'Ancient bamboo sanctuaries, thousand torii gates, and master kaiseki dining.',
      startingPrice: 1890,
      duration: '6 Days',
      image: '/src/assets/images/dest_kyoto_bamboo_1792642639795.jpg',
      tourId: 'tour_kyoto_zen',
    },
    {
      id: 'dest_santorini',
      name: 'Santorini',
      country: 'Greece',
      description: 'Caldera cliffside cave suites, catamaran sailing, and Aegean sunsets.',
      startingPrice: 2150,
      duration: '6 Days',
      image: '/src/assets/images/dest_santorini_view_1792642644829.jpg',
      tourId: 'tour_santorini_caldera',
    },
    {
      id: 'dest_dubai',
      name: 'Dubai',
      country: 'UAE',
      description: 'Futuristic glass horizons, luxury desert conservation oases, and private yachts.',
      startingPrice: 1650,
      duration: '5 Days',
      image: '/src/assets/images/dest_dubai_skyline_1792642640903.jpg',
      tourId: 'tour_dubai_futuristic',
    },
    {
      id: 'dest_manali',
      name: 'Manali',
      country: 'India',
      description: 'Towering Himalayan snow peaks, Solang valleys, and roaring river gorges.',
      startingPrice: 890,
      duration: '7 Days',
      image: '/src/assets/images/dest_manali_himalaya_1792642642153.jpg',
      tourId: 'tour_manali_himalayan',
    },
  ];

  const popularTours: TourForBooking[] = [
    {
      _id: 'tour_swiss_matterhorn',
      title: 'Swiss Alps Matterhorn & Glacier Express',
      destinationName: 'Swiss Alps',
      country: 'Switzerland',
      duration: '8 Days',
      price: 2680,
      capacity: 14,
      bookedCount: 6,
      departureDates: ['2026-11-20', '2026-12-18', '2027-01-15'],
      images: ['/src/assets/images/dest_swiss_alps_1792642639766.jpg'],
    },
    {
      _id: 'tour_santorini_caldera',
      title: 'Santorini Caldera Sunset & Aegean Voyage',
      destinationName: 'Santorini',
      country: 'Greece',
      duration: '6 Days',
      price: 2290,
      capacity: 14,
      bookedCount: 9,
      departureDates: ['2026-11-10', '2027-04-15', '2027-05-10'],
      images: ['/src/assets/images/dest_santorini_view_1792642644829.jpg'],
    },
    {
      _id: 'tour_bali_spiritual',
      title: 'Spiritual Bali & Island Horizons',
      destinationName: 'Bali',
      country: 'Indonesia',
      duration: '7 Days',
      price: 1350,
      capacity: 16,
      bookedCount: 8,
      departureDates: ['2026-11-15', '2026-12-05', '2027-01-20'],
      images: ['/src/assets/images/dest_bali_temple_1792642638723.jpg'],
    },
    {
      _id: 'tour_kyoto_zen',
      title: 'Kyoto Zen Heritage & Culinary Arts',
      destinationName: 'Kyoto',
      country: 'Japan',
      duration: '6 Days',
      price: 1980,
      capacity: 12,
      bookedCount: 5,
      departureDates: ['2026-11-25', '2026-12-10', '2027-02-08'],
      images: ['/src/assets/images/dest_kyoto_bamboo_1792642639795.jpg'],
    },
    {
      _id: 'tour_dubai_futuristic',
      title: 'Futuristic Dubai Skyline & Royal Desert Safari',
      destinationName: 'Dubai',
      country: 'UAE',
      duration: '5 Days',
      price: 1750,
      capacity: 18,
      bookedCount: 11,
      departureDates: ['2026-11-18', '2026-12-08', '2027-01-12'],
      images: ['/src/assets/images/dest_dubai_skyline_1792642640903.jpg'],
    },
    {
      _id: 'tour_manali_himalayan',
      title: 'Himalayan Ridge Trek & Solang Alpine Expedition',
      destinationName: 'Manali',
      country: 'India',
      duration: '7 Days',
      price: 940,
      capacity: 15,
      bookedCount: 7,
      departureDates: ['2026-11-05', '2027-03-15', '2027-04-10'],
      images: ['/src/assets/images/dest_manali_himalaya_1792642642153.jpg'],
    },
  ];

  const faqs = [
    {
      q: 'How does Aetheria guarantee remaining seat availability?',
      a: 'Our booking engine uses server-side atomic capacity management. When you reserve, seats are locked instantly, preventing duplicate bookings or over-allocation.',
    },
    {
      q: 'What is included in Aetheria’s curated tour packages?',
      a: 'All expeditions include vetted 5-star or luxury boutique stays, private transfers, expert local guides, and curated signature experiences (e.g. private helicopter charters, high-altitude train passes, catamaran cruises).',
    },
    {
      q: 'Can I cancel or reschedule my reservation?',
      a: 'Yes. Eligible bookings can be cancelled or rescheduled up to 14 days prior to departure through your Traveller Dashboard with immediate automated refund processing.',
    },
    {
      q: 'How does the 3D interactive globe assist my journey planning?',
      a: 'The 3D globe visualizes geographic distance, high-altitude coordinates, seasonal atmospheric conditions, and active flight paths, allowing you to intuitively explore global destinations before booking.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#060b14] text-white">
      {/* ==========================================================
          1. IMMERSIVE 3D HERO SECTION
          ========================================================== */}
      <section className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-slate-800">
        {/* 3D Scene Viewport (Unobstructed central background canvas) */}
        <div className="absolute inset-0 z-0">
          <GlobeHeroScene
            selectedDestinationId={selectedPinId}
            onSelectDestination={handleGlobeSelect}
          />
        </div>

        {/* Hero Narrative Overlay (Top-Left / Center Top with high contrast) */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-6 pointer-events-none w-full">
          <div className="max-w-2xl pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-400/30 rounded-full text-xs text-cyan-300 font-medium mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Travel Intelligence & 3D Expeditions</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-serif-display">
              Explore the World. <br />
              <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                Travel Beyond Limits.
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Discover extraordinary destinations, plan unforgettable journeys, and manage every adventure in one place with real-time capacity and seamless booking.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#destinations"
                className="px-6 py-3 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
              >
                Explore Destinations
              </a>
              <button
                onClick={() => navigate('/tours')}
                className="px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl transition-all shadow-lg shadow-orange-500/20"
              >
                Plan Your Trip
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 text-xs font-semibold text-slate-300 hover:text-white glass-panel rounded-xl hover:border-slate-500 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Travel Search Panel (Full-Width Strip Pinned At Base of Hero) */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 pb-8 w-full">
          <form
            onSubmit={handleSearchSubmit}
            className="glass-panel p-4 rounded-2xl border border-cyan-500/30 shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
          >
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Destination
              </label>
              <input
                type="text"
                value={searchDest}
                onChange={(e) => setSearchDest(e.target.value)}
                placeholder="Where to? (e.g. Bali, Swiss)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Departure Date
              </label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Voyagers
              </label>
              <select
                value={searchTravellers}
                onChange={(e) => setSearchTravellers(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value={1}>1 Voyager (Solo)</option>
                <option value={2}>2 Voyagers (Couple)</option>
                <option value={4}>4 Voyagers (Small Group)</option>
                <option value={8}>8 Voyagers (Expedition)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" /> Max Budget
              </label>
              <select
                value={searchBudget}
                onChange={(e) => setSearchBudget(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="All">Any Budget</option>
                <option value="1200">Under $1,200</option>
                <option value="2000">Under $2,000</option>
                <option value="3000">Under $3,000</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <Search className="w-4 h-4" />
              <span>Search Tours</span>
            </button>
          </form>
        </div>
      </section>

      {/* ==========================================================
          2. FEATURED DESTINATIONS (6 Cards from Prompt)
          ========================================================== */}
      <section id="destinations" className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">Curated Geography</div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-display text-white">
              Featured Global Destinations
            </h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md">
            Handpicked natural wonders and iconic cultural capitals. Select any destination to focus the 3D globe or view comprehensive packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.id}
              className="glass-card rounded-2xl overflow-hidden glass-card-hover group border border-slate-800"
            >
              {/* Image Frame */}
              <div className="relative h-60 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b132b] via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 text-[11px] font-semibold text-cyan-300 bg-slate-950/80 backdrop-blur-md rounded-lg border border-cyan-500/30">
                    {dest.duration}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4">
                  <span className="text-xs text-cyan-300 font-semibold">{dest.country}</span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{dest.name}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">
                  {dest.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Starting from</span>
                    <span className="text-base font-bold text-white font-mono tabular-nums">
                      ${dest.startingPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleGlobeSelect(dest as any);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 text-xs text-cyan-300 hover:text-white bg-cyan-950/50 hover:bg-cyan-900/50 rounded-lg border border-cyan-500/30 transition-colors"
                      title="Focus on 3D Globe"
                    >
                      3D Globe
                    </button>
                    <button
                      onClick={() => navigate(`/tours/${dest.tourId}`)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm"
                    >
                      View Tour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================================
          3. POPULAR TOUR PACKAGES
          ========================================================== */}
      <section className="py-20 bg-[#040810] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">
              Handcrafted Itineraries
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-display text-white">
              Popular Expedition Packages
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every tour features certified mountaineers or cultural scholars, guaranteed departures, and 24/7 private concierge response.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTours.map((tour) => {
              const remaining = Math.max(0, tour.capacity - tour.bookedCount);
              return (
                <div
                  key={tour._id}
                  className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={tour.images[0]}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b132b] via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-[10px] uppercase font-bold bg-slate-900/80 text-white rounded border border-slate-700">
                          {tour.destinationName}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 text-xs font-semibold text-amber-400 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>4.9</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{tour.title}</h3>
                      <div className="text-xs text-slate-400 space-y-1 mb-4">
                        <div className="flex items-center justify-between">
                          <span>Duration:</span>
                          <span className="text-slate-200">{tour.duration}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Availability:</span>
                          <span className={remaining < 5 ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                            {remaining} seats left
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-800/60 mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">From</span>
                      <span className="text-lg font-bold text-white font-mono tabular-nums">
                        ${tour.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/tours/${tour._id}`)}
                        className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setActiveBookingTour(tour)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-md shadow-orange-500/20 transition-all"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/tours')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-2 border border-cyan-500/30"
            >
              <span>Explore All Tour Packages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================================
          4. WHY CHOOSE US (Anti-Slop Clean Metrics)
          ========================================================== */}
      <section id="why-us" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">
            Engineered For Discerning Travelers
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-display text-white">
            Why Voyagers Choose Aetheria
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            We eliminate tourist intermediaries, providing direct access to verified mountain lodges, private charters, and high-altitude permits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Guaranteed Departure Protocol</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Once you confirm your reservation, your departure date is locked. We never cancel tours due to undersubscription.
            </p>
            <div className="text-cyan-400 text-xs font-semibold pt-2">100% Departure Reliability Rate</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">3D Geospatial Planning</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Experience the geography before setting foot on trail. Interactive 3D elevations, solar tracks, and weather profiles.
            </p>
            <div className="text-cyan-400 text-xs font-semibold pt-2">Full Terrain Pre-visualization</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">24/7 Field Concierge</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dedicated expedition coordinators on satellite communication during remote treks and private city transfers.
            </p>
            <div className="text-cyan-400 text-xs font-semibold pt-2">&lt; 15 Minute Dedicated Response</div>
          </div>
        </div>

        {/* Quantified Adjacency Proof Strip */}
        <div className="mt-12 glass-panel p-6 rounded-2xl border border-cyan-500/20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">4,280+</div>
            <div className="text-xs text-slate-400 mt-1">Expeditions Completed</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">99.7%</div>
            <div className="text-xs text-slate-400 mt-1">Voyager Satisfaction</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">18</div>
            <div className="text-xs text-slate-400 mt-1">Global Destinations</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">Zero</div>
            <div className="text-xs text-slate-400 mt-1">Hidden Surcharges</div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          5. HOW BOOKING WORKS (3 Steps)
          ========================================================== */}
      <section className="py-20 bg-[#040810] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">Effortless Journey Execution</div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-display text-white">
              How Booking Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
              <span className="text-4xl font-extrabold font-mono text-cyan-500/20 absolute top-4 right-4">01</span>
              <div className="text-cyan-400 font-bold text-sm mb-2">Select Your Journey</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Browse our curated catalogue, filter by style and budget, or inspect destinations on the 3D globe.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
              <span className="text-4xl font-extrabold font-mono text-cyan-500/20 absolute top-4 right-4">02</span>
              <div className="text-cyan-400 font-bold text-sm mb-2">Lock Remaining Capacity</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Select your departure date. Our engine instantly reserves seats with atomic server validation.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
              <span className="text-4xl font-extrabold font-mono text-cyan-500/20 absolute top-4 right-4">03</span>
              <div className="text-cyan-400 font-bold text-sm mb-2">Access Digital Dossier</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Receive your confirmed voucher, direct liaison briefing, and day-by-day expedition preparations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          6. TESTIMONIALS (Attributable)
          ========================================================== */}
      <section id="testimonials" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">Voyager Stories</div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-display text-white">
            Tested Across the Continents
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <p className="text-xs text-slate-300 italic leading-relaxed mb-6">
              "The Swiss Alps Matterhorn expedition was executed with surgical precision. From the Glacier Express Excellence Class to private ice moraine treks, every second was unforgettable."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Julian Vance"
                className="w-10 h-10 rounded-full object-cover border border-cyan-400/40"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <div className="font-bold text-white">Julian Vance</div>
                <div className="text-slate-400">Architect · San Francisco</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <p className="text-xs text-slate-300 italic leading-relaxed mb-6">
              "Private entry to Arashiyama before dawn and the exclusive tea master ceremony in Kyoto gave us intimacy with Japanese culture that standard agencies simply cannot offer."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                alt="Aria Chen"
                className="w-10 h-10 rounded-full object-cover border border-cyan-400/40"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <div className="font-bold text-white">Aria Chen</div>
                <div className="text-slate-400">Design Director · Singapore</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <p className="text-xs text-slate-300 italic leading-relaxed mb-6">
              "The high-altitude trek across Bhrigu Lake in Manali challenged us, but our guide's mountain wisdom and the luxury cedar chalet at the finish made it life-changing."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Elena Rostova"
                className="w-10 h-10 rounded-full object-cover border border-cyan-400/40"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <div className="font-bold text-white">Elena Rostova</div>
                <div className="text-slate-400">Alpinist · Geneva</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          7. FAQ ACCORDION
          ========================================================== */}
      <section className="py-20 bg-[#040810] border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">Clear Answers</div>
            <h2 className="text-3xl font-bold font-serif-display text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-xl border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-white hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-cyan-400' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for Booking */}
      {activeBookingTour && (
        <BookingModal
          tour={activeBookingTour}
          isOpen={!!activeBookingTour}
          onClose={() => setActiveBookingTour(null)}
        />
      )}
    </div>
  );
};
