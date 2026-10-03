import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import authService from '../services/auth';
import eventsService from '../services/events';
import membersService from '../services/members';
import financeService from '../services/finance';
import {
  Users,
  Calendar,
  Ticket,
  ShoppingBag,
  DollarSign,
  ArrowRight,
  AlertCircle,
  Clock,
  MapPin,
  Plus,
} from 'lucide-react';

function StatCard({ label, value, icon: Icon, to, subtext }) {
  const content = (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors">
      <div className="space-y-1">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
      </div>
      <div className="w-11 h-11 bg-sky-50 rounded-md flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-sky-600" />
      </div>
    </div>
  );
  if (to) {
    return (
      <Link to={to} className="block transition-transform active:scale-[0.99]">
        {content}
      </Link>
    );
  }
  return content;
}

export default function Dashboard() {
  const user = authService.getUser() || { name: 'User', role: 'Member' };
  const role = (user.role || 'Member').toLowerCase();
  const isAdmin = role.includes('admin') || role.includes('president');
  const isTreasurer = role.includes('treasurer');

  const [events, setEvents] = useState([]);
  const [memberCount, setMemberCount] = useState(null);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const evtsPromise = eventsService.getEvents();
        const membersPromise = (isAdmin || isTreasurer) ? membersService.getMembers({ limit: 100 }) : Promise.resolve(null);
        const financePromise = (isAdmin || isTreasurer) ? financeService.getFinanceSummary() : Promise.resolve(null);

        const [evtsRes, membersRes, financeRes] = await Promise.allSettled([
          evtsPromise,
          membersPromise,
          financePromise,
        ]);

        if (evtsRes.status === 'fulfilled' && Array.isArray(evtsRes.value)) {
          setEvents(evtsRes.value);
        }
        if (membersRes.status === 'fulfilled' && Array.isArray(membersRes.value)) {
          setMemberCount(membersRes.value.length);
        }
        if (financeRes.status === 'fulfilled' && financeRes.value) {
          setFinanceSummary(financeRes.value);
        }
      } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Failed to load dashboard data.';
        setError(typeof msg === 'string' ? msg : 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, isTreasurer]);

  const upcomingEvents = events.filter(
    (e) => e.status === 'upcoming' || e.status === 'ongoing'
  );

  const statusBadge = (status) => {
    const map = {
      upcoming: 'info',
      ongoing: 'success',
      completed: 'secondary',
      cancelled: 'danger',
    };
    return map[status] || 'secondary';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard records..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-slate-700">{user.name || 'Member'}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/events">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" /> New Event
              </Button>
            </Link>
          )}
          <Link to="/tickets">
            <Button variant="secondary" size="sm">
              <Ticket className="w-4 h-4 mr-1" /> My Tickets
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Events"
          value={events.length > 0 ? events.length : '0'}
          subtext={`${upcomingEvents.length} upcoming or ongoing`}
          icon={Calendar}
          to="/events"
        />

        {(isAdmin || isTreasurer) && (
          <StatCard
            label="Registered Members"
            value={memberCount !== null ? memberCount : '0'}
            subtext="Active member roster"
            icon={Users}
            to="/members"
          />
        )}

        {(isAdmin || isTreasurer) && financeSummary && (
          <StatCard
            label="Treasury Balance"
            value={`$${Number(financeSummary.balance || 0).toFixed(2)}`}
            subtext={`Income: $${Number(financeSummary.total_income || 0).toFixed(2)}`}
            icon={DollarSign}
            to="/finance"
          />
        )}

        <StatCard
          label="Merchandise"
          value="Store"
          subtext="Browse catalog and orders"
          icon={ShoppingBag}
          to="/merchandise"
        />
      </div>

      {/* Main Content Split: Upcoming Events & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Upcoming Events"
            subtitle="Scheduled activities and general body meetings"
            action={
              <Link
                to="/events"
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                View all ({events.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {upcomingEvents.length === 0 ? (
              <EmptyState
                title="No upcoming events scheduled"
                description="No upcoming events found. Create a new event or check back later."
                actionText={isAdmin ? 'Create Event' : undefined}
                onAction={isAdmin ? () => window.location.href = '/events' : undefined}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{event.title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatDate(event.event_date)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-slate-700">
                        {Number(event.ticket_price) === 0 ? 'Free' : `$${Number(event.ticket_price).toFixed(2)}`}
                      </span>
                      <Badge variant={statusBadge(event.status)}>{event.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Organization Shortcuts">
            <div className="space-y-2 text-sm">
              <Link
                to="/events"
                className="flex items-center justify-between p-2.5 rounded-md text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span className="font-medium">Events Calendar</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/tickets"
                className="flex items-center justify-between p-2.5 rounded-md text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 text-sky-600" />
                  <span className="font-medium">My Event Tickets</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/merchandise"
                className="flex items-center justify-between p-2.5 rounded-md text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-sky-600" />
                  <span className="font-medium">Merchandise Store</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              {(isAdmin || isTreasurer) && (
                <>
                  <Link
                    to="/members"
                    className="flex items-center justify-between p-2.5 rounded-md text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-sky-600" />
                      <span className="font-medium">Member Roster</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/finance"
                    className="flex items-center justify-between p-2.5 rounded-md text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="w-4 h-4 text-sky-600" />
                      <span className="font-medium">Finance & Treasury</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
