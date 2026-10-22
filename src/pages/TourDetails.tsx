import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { BookingModal } from '../components/booking/BookingModal.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Calendar,
  Clock,
  Users,
  Compass,
  Star,
  Check,
  X as CloseIcon,
  ShieldCheck,
  MapPin,
  Send,
  AlertCircle,
  Share2,
  Bookmark,
} from 'lucide-react';

export const TourDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Review submission
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Selected date in sticky panel
  const [selectedDate, setSelectedDate] = useState('');
  const [voyagerCount, setVoyagerCount] = useState(1);

  // Active gallery index
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    fetchTour();
  }, [id]);

  const fetchTour = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tours/${id}`);
      if (res.data.success) {
        setTour(res.data.data);
        if (res.data.data.departureDates?.length > 0) {
          setSelectedDate(res.data.data.departureDates[0]);
        }
      }
    } catch {
      // Failed
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!commentInput.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        tourId: tour._id,
        rating: ratingInput,
        comment: commentInput,
      });
      if (res.data.success) {
        setReviewMessage('Thank you! Your verified review has been published.');
        setCommentInput('');
        fetchTour();
      }
    } catch {
      setReviewMessage('Failed to post review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b14] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-[#060b14] flex flex-col items-center justify-center text-white px-6">
        <h2 className="text-xl font-bold mb-2">Tour Package Not Found</h2>
        <p className="text-slate-400 text-xs mb-4">The expedition you are looking for does not exist or has been archived.</p>
        <button
          onClick={() => navigate('/tours')}
          className="px-4 py-2 bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold"
        >
          Return to Tour Directory
        </button>
      </div>
    );
  }

  const remaining = Math.max(0, tour.capacity - tour.bookedCount);
  const subtotal = tour.price * voyagerCount;

  return (
    <div className="min-h-screen bg-[#060b14] text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-cyan-300">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/tours')} className="hover:text-cyan-300">Tours</button>
          <span>/</span>
          <span className="text-white truncate max-w-xs">{tour.title}</span>
        </div>

        {/* Cinematic Header Block */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-semibold">
              {tour.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tour.destinationName}, {tour.country}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold ml-auto">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{tour.rating}</span>
              <span className="text-slate-400 font-normal">({tour.reviewsCount} reviews)</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-display text-white">
            {tour.title}
          </h1>
        </div>

        {/* Large Cinematic Gallery */}
        <div className="mb-10 rounded-2xl overflow-hidden glass-panel border border-slate-800">
          <div className="relative h-[380px] sm:h-[480px]">
            <img
              src={tour.images[activeImageIdx] || tour.images[0]}
              alt={tour.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060b14] via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-6 flex items-center gap-3">
              <span className="px-3 py-1.5 bg-black/70 backdrop-blur-md text-xs font-medium text-white rounded-lg border border-slate-700">
                {tour.duration}
              </span>
              <span className="px-3 py-1.5 bg-black/70 backdrop-blur-md text-xs font-medium text-white rounded-lg border border-slate-700">
                Max {tour.capacity} Voyagers
              </span>
              <span className="px-3 py-1.5 bg-black/70 backdrop-blur-md text-xs font-medium text-white rounded-lg border border-slate-700">
                {tour.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Itinerary & Details vs Sticky Booking Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Details Column (col-span-2) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview Narrative */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold font-serif-display text-white mb-3">Expedition Blueprint</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Step into a curated realm where every detail—from private mountain railways and UNESCO heritage permits to secluded cliffside suites—has been engineered for discerning global travellers. Accompanied by field naturalists and private concierges, experience true wonder without administrative friction.
              </p>
            </div>

            {/* Day-by-Day Itinerary */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold font-serif-display text-white mb-6">Day-by-Day Itinerary</h2>
              <div className="space-y-6 relative border-l-2 border-cyan-500/30 ml-4 pl-6">
                {tour.itinerary?.map((day: any) => (
                  <div key={day.day} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 group-hover:bg-cyan-400 transition-colors" />
                    <div className="text-xs uppercase font-bold text-cyan-400 mb-0.5">Day {day.day}</div>
                    <h3 className="text-base font-bold text-white mb-1.5">{day.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">{day.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      {day.meals && <span>Meals: <strong className="text-slate-200">{day.meals}</strong></span>}
                      {day.stay && <span>· Stay: <strong className="text-slate-200">{day.stay}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions and Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  What Is Included
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {tour.inclusions?.map((inc: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <CloseIcon className="w-4 h-4 text-red-400" />
                  What Is Excluded
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {tour.exclusions?.map((exc: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold font-serif-display text-white">Verified Voyager Reviews</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Real feedback from completed expedition travelers.</p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>{tour.rating}</span>
                  <span className="text-slate-400 text-xs">/ 5.0</span>
                </div>
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 mb-6 space-y-3">
                <span className="text-xs font-semibold text-slate-200 block">Submit Your Feedback</span>
                {reviewMessage && (
                  <div className="p-2.5 bg-cyan-950/50 border border-cyan-500/30 rounded-lg text-xs text-cyan-300">
                    {reviewMessage}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Score:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingInput(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= ratingInput ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder={user ? "Write your impressions on route, accommodations, or guide expertise..." : "Please log in to submit a review."}
                  disabled={!user || reviewSubmitting}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                />
                <div className="flex justify-between items-center">
                  {!user && (
                    <span className="text-[11px] text-cyan-400 cursor-pointer" onClick={() => navigate('/login')}>
                      Sign in to post review →
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={!user || reviewSubmitting}
                    className="ml-auto px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </button>
                </div>
              </form>

              {/* Existing Reviews List */}
              <div className="space-y-4">
                {tour.reviews?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No reviews yet for this tour. Be the first to share your experience!</p>
                ) : (
                  tour.reviews?.map((rev: any) => (
                    <div key={rev._id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.userName)}`}
                            alt={rev.userName}
                            className="w-6 h-6 rounded-full object-cover border border-cyan-400/30"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-semibold text-white">{rev.userName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 font-mono">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sticky Booking Panel (Desktop Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 glass-panel p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-5">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Direct Price</span>
                  <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                    ${tour.price.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ person</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold ${remaining < 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {remaining} seats left
                  </span>
                  <span className="block text-[10px] text-slate-500">Atomic server lock</span>
                </div>
              </div>

              {/* Departure Date Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Departure Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {tour.departureDates?.map((date: string) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Voyagers */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Voyagers
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={Math.min(8, remaining)}
                    value={voyagerCount}
                    onChange={(e) => setVoyagerCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <span className="text-xs text-slate-400 whitespace-nowrap">Guests</span>
                </div>
              </div>

              {/* Subtotal Calculation */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>${tour.price} × {voyagerCount} guest(s)</span>
                  <span className="text-slate-200">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800 text-sm">
                  <span>Estimated Total</span>
                  <span className="text-cyan-400">${(subtotal + Math.round(subtotal * 0.05)).toLocaleString()}</span>
                </div>
              </div>

              {/* Action */}
              <button
                disabled={remaining === 0}
                onClick={() => setBookingOpen(true)}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50"
              >
                {remaining === 0 ? 'Sold Out for Season' : 'Reserve Expedition Seats'}
              </button>

              <div className="flex items-center gap-2 justify-center text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero Risk: Free cancellation up to 14 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingOpen && (
        <BookingModal
          tour={tour}
          isOpen={bookingOpen}
          onClose={() => setBookingOpen(false)}
          onBookingSuccess={fetchTour}
        />
      )}
    </div>
  );
};
