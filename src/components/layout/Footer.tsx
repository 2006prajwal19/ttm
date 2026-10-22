import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { Compass, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await api.post('/newsletter', { email });
      setSubscribed(true);
      setEmail('');
    } catch {
      // Fallback
      setSubscribed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-[#040810] border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & Editorial Mission */}
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-extrabold tracking-wider text-white flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>AETHERIA</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              A bespoke travel engineering platform uniting 3D geospatial intelligence, rare itineraries, and high-touch concierge support for discerning global voyagers.
            </p>
            <div className="text-xs text-slate-500">
              Licensed Expedition Operator · IATA 08-4192
            </div>
          </div>

          {/* Featured Destinations */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Destinations</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/tours?dest=Bali" className="hover:text-cyan-300 transition-colors">Bali, Indonesia</Link></li>
              <li><Link to="/tours?dest=Swiss%20Alps" className="hover:text-cyan-300 transition-colors">Swiss Alps, Switzerland</Link></li>
              <li><Link to="/tours?dest=Kyoto" className="hover:text-cyan-300 transition-colors">Kyoto, Japan</Link></li>
              <li><Link to="/tours?dest=Santorini" className="hover:text-cyan-300 transition-colors">Santorini, Greece</Link></li>
              <li><Link to="/tours?dest=Dubai" className="hover:text-cyan-300 transition-colors">Dubai, UAE</Link></li>
              <li><Link to="/tours?dest=Manali" className="hover:text-cyan-300 transition-colors">Manali, India</Link></li>
            </ul>
          </div>

          {/* Expedition Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Expedition Styles</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/tours?cat=Luxury" className="hover:text-cyan-300 transition-colors">Luxury Private Escapes</Link></li>
              <li><Link to="/tours?cat=Cultural" className="hover:text-cyan-300 transition-colors">Cultural & Heritage Immersions</Link></li>
              <li><Link to="/tours?cat=Mountain" className="hover:text-cyan-300 transition-colors">High-Altitude Alpine Treks</Link></li>
              <li><Link to="/tours?cat=Adventure" className="hover:text-cyan-300 transition-colors">Wilderness & Extreme Adventure</Link></li>
              <li><Link to="/tours?cat=Beach" className="hover:text-cyan-300 transition-colors">Tropical Island Expeditions</Link></li>
              <li><Link to="/tours?cat=Wildlife" className="hover:text-cyan-300 transition-colors">Wildlife Conservation Safaris</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-2">Private Travel Gazette</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Curated seasonal dispatches on rare departures, private chartered trains, and high-altitude permits.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>You have been added to our private dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-10"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="absolute right-1.5 top-1.5 p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded transition-colors disabled:opacity-50"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Zero spam. Unsubscribe anytime with one click.
                </span>
              </form>
            )}
          </div>
        </div>

        {/* Quiet Bottom Legal Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Aetheria Voyages Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Expedition</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Sustainability Covenant</span>
            <Link to="/admin" className="hover:text-cyan-400 transition-colors">Admin Gateway</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
