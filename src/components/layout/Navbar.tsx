import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Compass, User, LogOut, ShieldCheck, Bookmark, Calendar } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark, no subtitles) */}
        <Link to="/" className="text-xl font-extrabold tracking-wider text-white flex items-center gap-2 whitespace-nowrap shrink-0">
          <Compass className="w-5 h-5 text-cyan-400" />
          <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            AETHERIA
          </span>
        </Link>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Overview
          </Link>
          <Link to="/tours" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Tour Packages
          </Link>
          <a href="/#destinations" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Destinations
          </a>
          <a href="/#why-us" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Why Aetheria
          </a>
          <a href="/#testimonials" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Testimonials
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action / User Account */}
        <div className="flex items-center gap-4 shrink-0">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-800/60 transition-colors border border-cyan-500/30"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-cyan-400/40"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-semibold text-white hidden sm:inline max-w-[120px] truncate">
                  {user.name}
                </span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-2xl border border-slate-700 p-2 z-50 text-sm"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-xs">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors mt-1"
                  >
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>My Trips</span>
                  </Link>

                  <Link
                    to="/dashboard?tab=favorites"
                    className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span>Saved Favorites</span>
                  </Link>

                  <Link
                    to="/dashboard?tab=profile"
                    className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile Settings</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-cyan-300 hover:bg-cyan-950/50 rounded-lg transition-colors border-t border-slate-800/80 mt-1"
                    >
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Admin Management</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors border-t border-slate-800/80 mt-1 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-md shadow-orange-500/20 transition-all whitespace-nowrap shrink-0"
              >
                Explore Journeys
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
