import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { BookingModal, TourForBooking } from '../components/booking/BookingModal.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Compass,
  Bookmark,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const ExploreTours: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTours, setTotalTours] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState(searchParams.get('destination') || searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [difficulty, setDifficulty] = useState('All');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '4000');
  const [sort, setSort] = useState('popular');

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);

  // Booking Modal
  const [selectedTour, setSelectedTour] = useState<TourForBooking | null>(null);

  useEffect(() => {
    fetchTours();
    if (user) {
      fetchFavorites();
    }
  }, [category, difficulty, maxPrice, sort, currentPage, search]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 9,
      };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const res = await api.get('/tours', { params });
      if (res.data.success) {
        setTours(res.data.data);
        setTotalTours(res.data.total);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch tours', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      if (res.data.success) {
        setFavorites(res.data.data.map((t: any) => t._id));
      }
    } catch {
      // Ignored
    }
  };

  const toggleFavorite = async (tourId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    const isFav = favorites.includes(tourId);
    try {
      if (isFav) {
        await api.delete(`/favorites/${tourId}`);
        setFavorites(favorites.filter(id => id !== tourId));
      } else {
        await api.post(`/favorites/${tourId}`);
        setFavorites([...favorites, tourId]);
      }
    } catch {
      // Handled
    }
  };

  const categories = ['All', 'Luxury', 'Cultural', 'Adventure', 'Mountain', 'Beach', 'Wildlife'];
  const difficulties = ['All', 'Easy', 'Moderate', 'Challenging', 'Expert'];

  return (
    <div className="min-h-screen bg-[#060b14] text-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">
            Global Expedition Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display text-white">
            Curated Tour Packages
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Filter through handcrafted itineraries with verified group capacities, inclusive amenities, and dedicated field guides.
          </p>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 mb-10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search tour, destination, country..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="All">All Difficulty Levels</option>
                {difficulties.filter(d => d !== 'All').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="popular">Most Popular & Reviewed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Budget Range Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                <span>Max Budget:</span>
                <span className="text-cyan-400 font-bold">${Number(maxPrice).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="800"
                max="4000"
                step="100"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Category Tabs (Segmented Buttons) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  category === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-400">
          <span>Showing <strong className="text-white">{tours.length}</strong> of <strong className="text-white">{totalTours}</strong> available tour packages</span>
          {(search || category !== 'All' || difficulty !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setDifficulty('All');
                setMaxPrice('4000');
                setCurrentPage(1);
              }}
              className="text-cyan-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Tours Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 glass-panel rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center max-w-md mx-auto my-12 border border-slate-800">
            <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No tours found matching your criteria</h3>
            <p className="text-xs text-slate-400 mb-4">
              Try adjusting your search terms or expanding your budget range.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setDifficulty('All');
                setMaxPrice('4000');
              }}
              className="px-4 py-2 bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-300 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => {
              const remaining = Math.max(0, tour.capacity - tour.bookedCount);
              const isFav = favorites.includes(tour._id);

              return (
                <div
                  key={tour._id}
                  onClick={() => navigate(`/tours/${tour._id}`)}
                  className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 glass-card-hover flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Cover Frame */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={tour.images[0]}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b132b] via-transparent to-transparent opacity-80" />

                      {/* Destination & Country Tag */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 text-[10px] font-semibold bg-slate-950/80 text-white rounded-md border border-slate-700 backdrop-blur-md">
                          {tour.destinationName}, {tour.country}
                        </span>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(tour._id, e)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-700/80 text-white transition-colors"
                        title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        />
                      </button>

                      {/* Rating Badge */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{tour.rating}</span>
                        <span className="text-slate-400 text-[10px]">({tour.reviewsCount})</span>
                      </div>

                      {/* Category Label */}
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs text-cyan-300 font-semibold">{tour.category}</span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">
                        {tour.title}
                      </h3>

                      {/* Key Meta */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4 py-2 border-y border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{tour.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Max {tour.capacity} guests</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{tour.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${remaining < 5 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <span className={remaining < 5 ? 'text-amber-400 font-medium' : 'text-slate-300'}>
                            {remaining} seats left
                          </span>
                        </div>
                      </div>

                      {/* Inclusions summary preview */}
                      <div className="space-y-1 mb-4">
                        {tour.inclusions.slice(0, 2).map((inc: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Bar */}
                  <div className="p-5 pt-0 mt-auto border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total per voyager</span>
                      <span className="text-lg font-bold text-white font-mono tabular-nums">
                        ${tour.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tours/${tour._id}`);
                        }}
                        className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTour(tour);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-md shadow-orange-500/20 transition-all"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2 text-xs">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-semibold transition-colors ${
                  currentPage === i + 1
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Booking Checkout Modal */}
      {selectedTour && (
        <BookingModal
          tour={selectedTour}
          isOpen={!!selectedTour}
          onClose={() => setSelectedTour(null)}
          onBookingSuccess={fetchTours}
        />
      )}
    </div>
  );
};
