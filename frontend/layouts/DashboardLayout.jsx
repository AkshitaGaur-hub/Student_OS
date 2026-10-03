import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Calendar,
  Ticket,
  Megaphone,
  ShoppingBag,
  Package,
  HeartHandshake,
  DollarSign,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
} from 'lucide-react';
import authService from '../services/auth';
import Badge from '../components/Badge';

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getUser() || { name: 'User', role: 'Member' });
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/auth');
  };

  const role = currentUser.role || 'Member';
  const roleLower = role.toLowerCase();
  const isAdmin = roleLower.includes('admin') || roleLower.includes('president');
  const isTreasurer = roleLower.includes('treasurer');
  const isVolunteer = roleLower.includes('volunteer');

  // Base navigation definition with role constraints
  const allNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['all'] },
    { to: '/members', label: 'Members', icon: Users, roles: ['admin', 'treasurer'] },
    { to: '/events', label: 'Events', icon: Calendar, roles: ['all'] },
    { to: '/tickets', label: 'Tickets', icon: Ticket, roles: ['all'] },
    { to: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['admin', 'member'] },
    { to: '/merchandise', label: 'Merchandise', icon: ShoppingBag, roles: ['admin', 'member'] },
    { to: '/orders', label: 'Orders', icon: Package, roles: ['admin', 'treasurer', 'member'] },
    { to: '/fundraisers', label: 'Fundraisers', icon: HeartHandshake, roles: ['admin', 'volunteer'] },
    { to: '/finance', label: 'Finance', icon: DollarSign, roles: ['admin', 'treasurer'] },
    { to: '/profile', label: 'Profile', icon: User, roles: ['all'] },
  ];

  const visibleNavItems = allNavItems.filter((item) => {
    if (item.roles.includes('all')) return true;
    if (isAdmin) return true;
    if (isTreasurer && item.roles.includes('treasurer')) return true;
    if (isVolunteer && item.roles.includes('volunteer')) return true;
    if (!isAdmin && !isTreasurer && !isVolunteer && item.roles.includes('member')) return true;
    return false;
  });

  const getBadgeVariant = (r) => {
    const l = (r || '').toLowerCase();
    if (l.includes('admin') || l.includes('president')) return 'danger';
    if (l.includes('treasurer')) return 'warning';
    if (l.includes('volunteer')) return 'info';
    return 'success';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link to="/dashboard" className="flex items-center gap-2 text-sky-700 font-bold text-lg">
          <GraduationCap className="w-6 h-6" />
          <span>Student_OS</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant={getBadgeVariant(role)}>{role}</Badge>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-sky-700 font-bold text-xl">
            <GraduationCap className="w-7 h-7" />
            <span>Student_OS</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.name || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={getBadgeVariant(role)}>{role}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 border-l-4 border-sky-600 pl-2'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-200 space-y-1 bg-slate-50/30">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Portal</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-white border-b border-slate-200 h-16 px-6 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-semibold text-slate-800">Student Organization System</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-medium text-slate-700 block">{currentUser.name || 'Member'}</span>
              <span className="text-[11px] text-slate-400 capitalize">{role}</span>
            </div>
            <Badge variant={getBadgeVariant(role)}>{role}</Badge>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
