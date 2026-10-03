import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  ShoppingBag,
  Calendar,
  Megaphone,
  LogIn,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import authService from '../services/auth';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  const navLinks = [
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/merchandise', label: 'Merchandise', icon: ShoppingBag },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F7] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sky-700 font-bold text-lg hover:text-sky-800">
            <GraduationCap className="w-6 h-6" />
            <span>Student_OS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'text-sky-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/cart"
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            <div className="hidden sm:block">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Student_OS. Student Organization Management System.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-slate-800">
              Privacy Policy
            </Link>
            <Link to="/terms-conditions" className="hover:text-slate-800">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
