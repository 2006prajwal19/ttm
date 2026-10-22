import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';
import {
  Calendar,
  Compass,
  User,
  Bookmark,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  MapPin,
  Settings,
  CreditCard,
} from 'lucide-react';

export const TravellerDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'trips' | 'favorites' | 'profile'>(
    (searchParams.get('tab') as any) || 'trips'
  );

  const [bookings, setBookings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [travelPreferences, setTravelPreferences] = useState(user?.travelPreferences || '');
  const [dietaryRequirements, setDietaryRequirements] = useState(user?.dietaryRequirements || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Cancellation Modal
  const [cancelModalBooking, setCancelModalBooking] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bRes, fRes] = await Promise.all([
        api.get('/bookings/my-bookings'),
        api.get('/favorites'),
      ]);
      if (bRes.data.success) setBookings(bRes.data.data);
      if (fRes.data.success) setFavorites(fRes.data.data);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({
      phone,
      country,
      emergencyContact,
      travelPreferences,
      dietaryRequirements,
    });
    if (res.success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      const res = await api.patch(`/bookings/${cancelModalBooking._id}/cancel`);
      if (res.data.success) {
        setCancelModalBooking(null);
        fetchDashboardData();
      }
    } catch {
      // Ignored
    } finally {
      setCancelling(false);
    }
  };

  const upcomingBookings = bookings.filter(b => b.bookingStatus === 'Confirmed');
  const pendingBookings = bookings.filter(b => b.bookingStatus === 'Pending');
  const pastBookings = bookings.filter(b => b.bookingStatus === 'Completed');
  const cancelledBookings = bookings.filter(b => b.bookingStatus === 'Cancelled');

  return (
    <div className="min-h-screen bg-[#060b14] text-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || '')}`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/40"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Voyager Concierge</div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-white">
                Welcome back, {user?.name}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.country ? `${user.country} · ` : ''}Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-center">
            <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Active Bookings</span>
              <span className="text-xl font-bold text-cyan-400 font-mono tabular-nums">
                {upcomingBookings.length + pendingBookings.length}
              </span>
            </div>
            <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Total Expeditions</span>
              <span className="text-xl font-bold text-white font-mono tabular-nums">{bookings.length}</span>
            </div>
            <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Saved Favorites</span>
              <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">{favorites.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls (Segmented Tabs) */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('trips')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'trips'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>My Expeditions ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Saved Favorites ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Voyager Profile & Preferences</span>
          </button>
        </div>

        {/* ==========================================================
            TAB 1: TRIPS & RESERVATIONS
            ========================================================== */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 max-w-md mx-auto">
                <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Expeditions Booked Yet</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Discover rare high-altitude routes and coastal hideaways on our tour catalog.
                </p>
                <button
                  onClick={() => navigate('/tours')}
                  className="px-4 py-2 bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg hover:bg-cyan-300 transition-colors"
                >
                  Explore Expeditions
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((booking) => {
                  const isConfirmed = booking.bookingStatus === 'Confirmed';
                  const isCancelled = booking.bookingStatus === 'Cancelled';
                  const isPending = booking.bookingStatus === 'Pending';

                  return (
                    <div
                      key={booking._id}
                      className="glass-card p-5 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={booking.tourImage}
                          alt={booking.tourTitle}
                          className="w-24 h-20 object-cover rounded-xl border border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-cyan-400">
                              REF: {booking.bookingReference}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isConfirmed
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                                  : isCancelled
                                  ? 'bg-red-950/80 text-red-300 border border-red-500/30'
                                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              ● {booking.bookingStatus}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white">{booking.tourTitle}</h3>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-cyan-400" />
                              {booking.destinationName}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-cyan-400" />
                              {new Date(booking.departureDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <span>·</span>
                            <span>{booking.travellerCount} Voyager(s)</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Meta & Actions */}
                      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-slate-400 block">Total Settled</span>
                          <span className="text-base font-bold text-white font-mono tabular-nums">
                            ${booking.totalPrice.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/tours/${booking.tourId}`)}
                            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            Tour Details
                          </button>
                          {!isCancelled && (
                            <button
                              onClick={() => setCancelModalBooking(booking)}
                              className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/30 rounded-lg border border-red-500/30 transition-colors"
                            >
                              Cancel Trip
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==========================================================
            TAB 2: FAVORITES
            ========================================================== */}
        {activeTab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 max-w-md mx-auto">
                <Bookmark className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Saved Favorites</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Save journeys while browsing the catalogue to compare dates and rates later.
                </p>
                <button
                  onClick={() => navigate('/tours')}
                  className="px-4 py-2 bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg hover:bg-cyan-300 transition-colors"
                >
                  Browse Tours
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((tour) => (
                  <div
                    key={tour._id}
                    onClick={() => navigate(`/tours/${tour._id}`)}
                    className="glass-card rounded-2xl overflow-hidden border border-slate-800 glass-card-hover cursor-pointer"
                  >
                    <img
                      src={tour.images[0]}
                      alt={tour.title}
                      className="w-full h-44 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-4">
                      <span className="text-[10px] text-cyan-300 uppercase font-semibold">{tour.destinationName}</span>
                      <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5">{tour.title}</h4>
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <span className="text-slate-400 font-mono">${tour.price} / person</span>
                        <span className="text-cyan-400 font-semibold">View Tour →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================================
            TAB 3: PROFILE & PREFERENCES
            ========================================================== */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif-display text-white">Voyager Profile & Requirements</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your medical, dietary, and emergency liaison specifications are shared securely with lead guides prior to departure.
              </p>
            </div>

            {profileSaved && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Your profile preferences have been successfully updated.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 opacity-70"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 opacity-70"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Country of Residence</label>
                <input
                  type="text"
                  placeholder="e.g. Switzerland, United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Emergency Contact Information</label>
                <input
                  type="text"
                  placeholder="Contact Name & Emergency Phone Number"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Dietary & Accessibility Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. Strict vegetarian, gluten intolerance, high-altitude acclimatization note"
                  value={dietaryRequirements}
                  onChange={(e) => setDietaryRequirements(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Travel Style & Preferences</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Photography, historical architecture, secluded luxury chalets, mountain treks"
                  value={travelPreferences}
                  onChange={(e) => setTravelPreferences(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20"
            >
              Save Profile Changes
            </button>
          </form>
        )}
      </div>

      {/* Cancellation Confirmation Dialog */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-red-500/30 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Cancel Expedition Booking?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel your reservation for <strong>{cancelModalBooking.tourTitle}</strong> (Ref: {cancelModalBooking.bookingReference})?
              Your {cancelModalBooking.travellerCount} reserved seat(s) will be released back to inventory, and a full refund of ${cancelModalBooking.totalPrice.toLocaleString()} will be automatically processed.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Keep Booking
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
