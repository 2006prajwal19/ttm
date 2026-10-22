import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';
import {
  Users,
  Compass,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  Edit2,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Database,
  MapPin,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'tours' | 'travellers' | 'bookings' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalTravellers: 0,
    totalTours: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    revenue: 0,
  });

  // Analytics data
  const [analytics, setAnalytics] = useState<any>({
    monthlyData: [],
    destinationPopularity: [],
    statusDistribution: [],
  });

  // Tables data
  const [tours, setTours] = useState<any[]>([]);
  const [travellers, setTravellers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  // Search & Filter filters
  const [travellerSearch, setTravellerSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('All');

  // Tour Creation / Edit Modal
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);
  const [tourForm, setTourForm] = useState({
    title: '',
    destinationName: 'Bali',
    country: 'Indonesia',
    category: 'Adventure',
    price: 1400,
    duration: '7 Days',
    capacity: 14,
    difficulty: 'Moderate',
    departureDates: '2026-11-20, 2026-12-15',
    inclusions: 'Luxury accommodation, certified guides, gourmet breakfasts',
    exclusions: 'International flights, personal items',
  });

  // Notification message
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, toursRes, travellersRes, bookingsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/analytics'),
        api.get('/tours?limit=50'),
        api.get('/admin/users'),
        api.get('/admin/bookings'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (toursRes.data.success) setTours(toursRes.data.data);
      if (travellersRes.data.success) setTravellers(travellersRes.data.data);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...tourForm,
        departureDates: tourForm.departureDates.split(',').map(s => s.trim()),
        inclusions: tourForm.inclusions.split(',').map(s => s.trim()),
        exclusions: tourForm.exclusions.split(',').map(s => s.trim()),
      };

      if (editingTour) {
        await api.put(`/tours/${editingTour._id}`, payload);
        showFeedback('Tour package updated successfully.');
      } else {
        await api.post('/tours', payload);
        showFeedback('New tour package published.');
      }
      setTourModalOpen(false);
      setEditingTour(null);
      fetchAdminData();
    } catch {
      showFeedback('Error saving tour package.');
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!window.confirm('Are you sure you want to delete or deactivate this tour?')) return;
    try {
      const res = await api.delete(`/tours/${tourId}`);
      showFeedback(res.data.message || 'Tour removed.');
      fetchAdminData();
    } catch {
      showFeedback('Failed to remove tour.');
    }
  };

  const handleToggleTravellerStatus = async (travellerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/admin/users/${travellerId}/status`, { status: nextStatus });
      if (res.data.success) {
        showFeedback(`User account ${nextStatus === 'suspended' ? 'suspended' : 'reactivated'}.`);
        fetchAdminData();
      }
    } catch (err: any) {
      showFeedback(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, nextStatus: string) => {
    try {
      const res = await api.patch(`/admin/bookings/${bookingId}/status`, { bookingStatus: nextStatus });
      if (res.data.success) {
        showFeedback(`Booking status updated to ${nextStatus}.`);
        fetchAdminData();
      }
    } catch {
      showFeedback('Failed to update booking status.');
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset database to clean default sample seed records?')) return;
    try {
      await api.post('/admin/reset-seed');
      showFeedback('Database successfully re-seeded.');
      fetchAdminData();
    } catch {
      showFeedback('Error resetting database.');
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const filteredTravellers = travellers.filter(t =>
    t.name.toLowerCase().includes(travellerSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(travellerSearch.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => {
    if (bookingFilterStatus === 'All') return true;
    return b.bookingStatus === bookingFilterStatus;
  });

  return (
    <div className="min-h-screen bg-[#060b14] text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Aetheria Central Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-white">
              Administrator Management Console
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setEditingTour(null);
                setTourForm({
                  title: '',
                  destinationName: 'Bali',
                  country: 'Indonesia',
                  category: 'Adventure',
                  price: 1400,
                  duration: '7 Days',
                  capacity: 14,
                  difficulty: 'Moderate',
                  departureDates: '2026-11-20, 2026-12-15',
                  inclusions: 'Luxury boutique villa, certified guide, private transport',
                  exclusions: 'International flights, personal insurance',
                });
                setTourModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Tour</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMessage && (
          <div className="mb-6 p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-xs text-cyan-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Tab Navigation (Segmented Controls) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'tours'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tour Inventory ({tours.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Booking Reservations ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('travellers')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'travellers'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Traveller Directory ({travellers.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Database & System
          </button>
        </div>

        {/* ==========================================================
            TAB 1: OVERVIEW & ANALYTICS
            ========================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs">Eligible Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                  ${stats.revenue.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Confirmed + Completed Bookings</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs">Total Bookings</span>
                  <Calendar className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  {stats.totalBookings}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {stats.confirmedBookings} Confirmed · {stats.pendingBookings} Pending
                </span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs">Active Tours</span>
                  <Compass className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  {stats.totalTours}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Across 6 Global Destinations</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs">Registered Travellers</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  {stats.totalTravellers}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Verified user profiles</span>
              </div>
            </div>

            {/* Recharts Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Booking & Revenue Trends */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-1">Monthly Booking & Revenue Trends</h3>
                <p className="text-[11px] text-slate-400 mb-6">Gross reservation turnover by month</p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0b132b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val: any) => [`$${val.toLocaleString()}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Destination Popularity */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-1">Destination Voyager Inflow</h3>
                <p className="text-[11px] text-slate-400 mb-6">Voyagers booked per geographic hub</p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.destinationPopularity} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0b132b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val: any) => [`${val} Voyagers`, 'Volume']}
                      />
                      <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            TAB 2: TOURS MANAGEMENT
            ========================================================== */}
        {activeTab === 'tours' && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Active Tour Inventory</h2>
              <span className="text-xs text-slate-400">{tours.length} packages loaded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-2">Tour Package</th>
                    <th className="py-3 px-2">Destination</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Price</th>
                    <th className="py-3 px-2">Capacity</th>
                    <th className="py-3 px-2">Reserved</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tours.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-2 font-semibold text-white max-w-xs truncate">
                        {t.title}
                      </td>
                      <td className="py-3 px-2 text-slate-300">{t.destinationName}, {t.country}</td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/20">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono tabular-nums text-white">${t.price}</td>
                      <td className="py-3 px-2 font-mono tabular-nums">{t.capacity}</td>
                      <td className="py-3 px-2 font-mono tabular-nums text-cyan-400">{t.bookedCount}</td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingTour(t);
                            setTourForm({
                              title: t.title,
                              destinationName: t.destinationName,
                              country: t.country,
                              category: t.category,
                              price: t.price,
                              duration: t.duration,
                              capacity: t.capacity,
                              difficulty: t.difficulty,
                              departureDates: t.departureDates.join(', '),
                              inclusions: t.inclusions.join(', '),
                              exclusions: t.exclusions.join(', '),
                            });
                            setTourModalOpen(true);
                          }}
                          className="p-1 hover:text-cyan-400 text-slate-400 transition-colors"
                          title="Edit Tour"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTour(t._id)}
                          className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                          title="Delete Tour"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================================
            TAB 3: BOOKINGS MANAGEMENT
            ========================================================== */}
        {activeTab === 'bookings' && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Expedition Bookings</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter Status:</span>
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-2">Ref Code</th>
                    <th className="py-3 px-2">Voyager</th>
                    <th className="py-3 px-2">Expedition</th>
                    <th className="py-3 px-2">Departure</th>
                    <th className="py-3 px-2">Seats</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-2 font-mono font-bold text-cyan-300">{b.bookingReference}</td>
                      <td className="py-3 px-2 text-white">
                        <div>{b.travellerName}</div>
                        <div className="text-[10px] text-slate-400">{b.travellerEmail}</div>
                      </td>
                      <td className="py-3 px-2 max-w-xs truncate text-slate-300">{b.tourTitle}</td>
                      <td className="py-3 px-2 font-mono">{b.departureDate}</td>
                      <td className="py-3 px-2 font-mono">{b.travellerCount}</td>
                      <td className="py-3 px-2 font-mono font-bold text-white">${b.totalPrice.toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.bookingStatus === 'Confirmed'
                              ? 'bg-emerald-950 text-emerald-300'
                              : b.bookingStatus === 'Cancelled'
                              ? 'bg-red-950 text-red-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <select
                          value={b.bookingStatus}
                          onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                          className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] text-white"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================================
            TAB 4: TRAVELLERS MANAGEMENT
            ========================================================== */}
        {activeTab === 'travellers' && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Registered Voyagers</h2>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={travellerSearch}
                  onChange={(e) => setTravellerSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-2">Voyager</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2">Country</th>
                    <th className="py-3 px-2">Dietary / Accessibility</th>
                    <th className="py-3 px-2">Account Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTravellers.map((trav) => (
                    <tr key={trav._id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-2 flex items-center gap-2">
                        <img
                          src={trav.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trav.name)}`}
                          alt={trav.name}
                          className="w-7 h-7 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-white">{trav.name}</div>
                          <div className="text-[10px] text-slate-400">{trav.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] uppercase font-bold text-cyan-400">{trav.role}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-300">{trav.country || 'Not specified'}</td>
                      <td className="py-3 px-2 text-slate-300 max-w-xs truncate">{trav.dietaryRequirements || 'None'}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            trav.status === 'active' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                          }`}
                        >
                          ● {trav.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {trav.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleTravellerStatus(trav._id, trav.status)}
                            className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                              trav.status === 'active'
                                ? 'bg-red-950/60 text-red-300 hover:bg-red-900'
                                : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
                            }`}
                          >
                            {trav.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================================
            TAB 5: DATABASE & SYSTEM SETTINGS
            ========================================================== */}
        {activeTab === 'settings' && (
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 max-w-3xl space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-xs uppercase font-bold text-cyan-400">Database & Architecture</span>
              </div>
              <h2 className="text-xl font-bold font-serif-display text-white">System Environment</h2>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Database Engine:</span>
                <span className="text-white font-mono">Mongoose 9.x + MongoDB Driver</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target MongoDB URI:</span>
                <span className="text-cyan-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  mongodb://localhost:27017
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Authentication:</span>
                <span className="text-white font-mono">MongoDB Sessions Collection (7-Day TTL)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Concurrency Safety:</span>
                <span className="text-cyan-400 font-mono">Atomic reservation locks on capacity</span>
              </div>
            </div>

            <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-cyan-300">Local MongoDB Service Configuration</h4>
              <p className="text-slate-300 leading-relaxed">
                Your MongoDB connection string is configured to <code className="text-cyan-300 font-mono font-semibold">mongodb://localhost:27017</code>.
                When running MongoDB locally on port 27017, run:
              </p>
              <div className="p-2.5 bg-slate-950 rounded font-mono text-[11px] text-cyan-300 space-y-1">
                <div># Start MongoDB daemon:</div>
                <div className="text-white">mongod --dbpath /data/db --port 27017</div>
                <div className="pt-1 text-slate-400"># Populate default tours, destinations, and demo users:</div>
                <div className="text-white">npm run seed</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Seed Data Restoration</span>
                <span className="text-[11px] text-slate-400">Reset tours, bookings, and sample users to default verified state.</span>
              </div>
              <button
                onClick={handleResetSeed}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-cyan-500/30 transition-colors"
              >
                Reset & Re-seed
              </button>
            </div>
          </div>
        )}

        {/* Tour Creation / Editing Modal */}
        {tourModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-xl glass-panel p-6 rounded-2xl border border-cyan-500/30 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">
                  {editingTour ? 'Edit Tour Package' : 'Create New Expedition Tour'}
                </h3>
                <button onClick={() => setTourModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTour} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tour Title</label>
                  <input
                    type="text"
                    required
                    value={tourForm.title}
                    onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Destination Hub</label>
                    <select
                      value={tourForm.destinationName}
                      onChange={(e) => setTourForm({ ...tourForm, destinationName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="Bali">Bali</option>
                      <option value="Swiss Alps">Swiss Alps</option>
                      <option value="Kyoto">Kyoto</option>
                      <option value="Santorini">Santorini</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Manali">Manali</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={tourForm.category}
                      onChange={(e) => setTourForm({ ...tourForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="Adventure">Adventure</option>
                      <option value="Beach">Beach</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Wildlife">Wildlife</option>
                      <option value="Mountain">Mountain</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Price ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={tourForm.price}
                      onChange={(e) => setTourForm({ ...tourForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Capacity</label>
                    <input
                      type="number"
                      required
                      value={tourForm.capacity}
                      onChange={(e) => setTourForm({ ...tourForm, capacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Duration</label>
                    <input
                      type="text"
                      required
                      value={tourForm.duration}
                      onChange={(e) => setTourForm({ ...tourForm, duration: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Departure Dates (comma-separated YYYY-MM-DD)</label>
                  <input
                    type="text"
                    value={tourForm.departureDates}
                    onChange={(e) => setTourForm({ ...tourForm, departureDates: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Inclusions (comma-separated)</label>
                  <input
                    type="text"
                    value={tourForm.inclusions}
                    onChange={(e) => setTourForm({ ...tourForm, inclusions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setTourModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg"
                  >
                    Save Tour
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
