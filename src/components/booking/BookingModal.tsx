import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../services/api.js';
import { X, Calendar, Users, CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export interface TourForBooking {
  _id: string;
  title: string;
  price: number;
  duration: string;
  destinationName: string;
  country: string;
  departureDates: string[];
  capacity: number;
  bookedCount: number;
  images: string[];
}

interface BookingModalProps {
  tour: TourForBooking;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ tour, isOpen, onClose, onBookingSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [departureDate, setDepartureDate] = useState(tour.departureDates[0] || '');
  const [travellerCount, setTravellerCount] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Mock Card Form state (Not stored raw, demonstration tokenization)
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('•••');

  if (!isOpen) return null;

  const remainingSeats = Math.max(0, tour.capacity - tour.bookedCount);
  const subtotal = tour.price * travellerCount;
  const conciergeFee = Math.round(subtotal * 0.05);
  const total = subtotal + conciergeFee;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!departureDate) {
      setError('Please select an available departure date.');
      return;
    }
    if (travellerCount > remainingSeats) {
      setError(`Only ${remainingSeats} seat(s) remaining for this tour.`);
      return;
    }
    setError(null);
    setStep('payment');
  };

  const handleConfirmReservation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/bookings', {
        tourId: tour._id,
        departureDate,
        travellerCount,
        travellerName: name,
        travellerEmail: email,
        travellerPhone: phone,
        specialRequests,
      });

      if (res.data.success) {
        setConfirmedBooking(res.data.booking);
        setStep('confirmed');
        if (onBookingSuccess) onBookingSuccess();
      } else {
        setError(res.data.message || 'Booking reservation could not be processed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server error reserving expedition seats.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold">
              Secure Expedition Booking
            </span>
            <h3 className="text-lg font-bold text-white truncate max-w-md">{tour.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              {/* Tour Overview Snippet */}
              <div className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <img
                  src={tour.images[0]}
                  alt={tour.title}
                  className="w-20 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white">{tour.destinationName}, {tour.country}</div>
                  <div className="text-slate-400">{tour.duration} · Max {tour.capacity} voyagers</div>
                  <div className="text-cyan-400 font-bold mt-1">
                    ${tour.price.toLocaleString()} <span className="text-slate-400 font-normal">/ person</span>
                  </div>
                </div>
              </div>

              {/* Date & Voyagers Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Select Departure Date
                  </label>
                  <select
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {tour.departureDates.map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    Number of Travellers
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={Math.min(10, remainingSeats)}
                      value={travellerCount}
                      onChange={(e) => setTravellerCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {remainingSeats} left
                    </span>
                  </div>
                </div>
              </div>

              {/* Lead Traveller Info */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block">Lead Voyager Contact</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Legal Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Contact Phone (+ Country Code)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <textarea
                  rows={2}
                  placeholder="Special requests: Dietary restrictions, room configuration, anniversary note..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Price Calculation Card */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>${tour.price.toLocaleString()} × {travellerCount} voyager(s)</span>
                  <span className="font-mono tabular-nums">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Concierge Service & Insurance (5%)</span>
                  <span className="font-mono tabular-nums">${conciergeFee.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
                  <span>Guaranteed Total</span>
                  <span className="text-cyan-400 font-mono tabular-nums">${total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
              >
                Proceed to Secure Confirmation
              </button>
            </form>
          )}

          {/* STEP 2: Mock Payment & Guarantee */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Aetheria Verified Escrow Payment</span>
                </div>
                <p className="text-slate-400">
                  Development simulation mode. Card details are processed through mock vault tokens and never stored raw.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    Payment Method
                  </span>
                  <span className="text-cyan-400 text-[11px]">Instant Tokenized Authorization</span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Reservation for</span>
                  <span className="text-white font-medium">{name} ({travellerCount} voyagers)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Departure Date</span>
                  <span className="text-white font-medium">{departureDate}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800 text-sm">
                  <span>Amount to Authorize</span>
                  <span className="text-cyan-400 font-mono tabular-nums">${total.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmReservation}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {loading ? 'Confirming Reservation...' : `Authorize & Reserve ($${total.toLocaleString()})`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmed Voucher Receipt */}
          {step === 'confirmed' && confirmedBooking && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                  Reservation Confirmed & Guaranteed
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">Ready for Expedition!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Your journey has been officially logged in our system. A digital expedition dossier has been dispatched to your email.
                </p>
              </div>

              {/* Receipt Ticket */}
              <div className="p-5 bg-slate-900 rounded-2xl border border-cyan-500/30 text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">REFERENCE NUMBER</span>
                  <span className="font-bold text-cyan-300 text-sm">{confirmedBooking.bookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">EXPEDITION</span>
                  <span className="text-white font-sans font-semibold">{confirmedBooking.tourTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DEPARTURE</span>
                  <span className="text-white">{confirmedBooking.departureDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VOYAGERS</span>
                  <span className="text-white">{confirmedBooking.travellerCount} Guest(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TOTAL SETTLED</span>
                  <span className="text-emerald-400 font-bold">${confirmedBooking.totalPrice.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">STATUS</span>
                  <span className="text-cyan-400 font-sans font-bold">● {confirmedBooking.bookingStatus}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/dashboard');
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20"
                >
                  View in My Dashboard
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
