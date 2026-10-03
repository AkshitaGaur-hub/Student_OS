import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Select from '../components/Select';
import ticketsService from '../services/tickets';
import eventsService from '../services/events';
import authService from '../services/auth';
import { Ticket, QrCode, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import QRCode from 'qrcode';

const QRCodeImage = ({ text }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    QRCode.toDataURL(text, { width: 120, margin: 1 })
      .then(url => setSrc(url))
      .catch(err => console.error(err));
  }, [text]);

  if (!src) return null;
  return <img src={src} alt="QR Code" className="w-20 h-20 mx-auto rounded shadow-sm border border-slate-200" />;
};

const statusVariant = (s) => {
  const m = { active: 'success', used: 'secondary', cancelled: 'danger', refunded: 'warning' };
  return m[s] || 'secondary';
};

export default function Tickets() {
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [myTickets, setMyTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check-in state
  const [ticketCode, setTicketCode] = useState('');
  const [checkInMessage, setCheckInMessage] = useState('');
  const [checkInError, setCheckInError] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);

  // Purchase ticket
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');

  const user = authService.getUser() || {};
  const role = (user.role || '').toLowerCase();
  const isStaff = role.includes('admin') || role.includes('volunteer') || role.includes('treasurer');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tickets, evts] = await Promise.all([
        ticketsService.getMyTickets(),
        eventsService.getEvents(),
      ]);
      setMyTickets(Array.isArray(tickets) ? tickets : []);
      setEvents(Array.isArray(evts) ? evts.filter((e) => e.status === 'upcoming' || e.status === 'ongoing') : []);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to load tickets.';
      setError(typeof msg === 'string' ? msg : 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    setCheckInLoading(true);
    setCheckInMessage('');
    setCheckInError('');
    try {
      const response = await ticketsService.verifyTicketByCode(ticketCode.trim());
      setCheckInMessage(response.message);
      setTicketCode('');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Check-in failed.';
      setCheckInError(typeof msg === 'string' ? msg : 'Check-in failed.');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleBuyTicket = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setBuying(true);
    setBuyError('');
    try {
      await ticketsService.purchaseTicket({ event_id: parseInt(selectedEventId, 10) });
      setBuyModalOpen(false);
      setSelectedEventId('');
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Purchase failed.';
      setBuyError(typeof msg === 'string' ? msg : 'Purchase failed.');
    } finally {
      setBuying(false);
    }
  };

  const eventOptions = events.map((e) => ({
    value: String(e.id),
    label: `${e.title} (${Number(e.ticket_price) === 0 ? 'Free' : `$${Number(e.ticket_price).toFixed(2)}`})`,
  }));

  const formatDate = (iso) => {
    if (!iso) return '--';
    try {
      return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets & Attendance</h1>
          <p className="text-sm text-slate-500">Manage event admission passes and check-in desk</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setBuyError('');
            setSelectedEventId('');
            setBuyModalOpen(true);
          }}
        >
          <ShoppingCart className="w-4 h-4 mr-1" /> Get Ticket
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('my-tickets')}
          className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'my-tickets'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Ticket className="w-4 h-4" />
          My Tickets ({myTickets.length})
        </button>
        {isStaff && (
          <button
            type="button"
            onClick={() => setActiveTab('check-in')}
            className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'check-in'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Check-in Desk
          </button>
        )}
      </div>

      {activeTab === 'my-tickets' && (
        <Card>
          {loading ? (
            <Loading message="Loading tickets..." />
          ) : myTickets.length === 0 ? (
            <EmptyState
              icon={<Ticket className="w-6 h-6 text-slate-400" />}
              title="No tickets in your wallet"
              description="Register for an organization event to receive an admission ticket."
              actionText="Get Ticket"
              onAction={() => setBuyModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Ticket Code</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Event</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Price Paid</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Status</th>
                    <th className="pb-3 pr-4 font-semibold text-slate-600">Purchased</th>
                    <th className="pb-3 font-semibold text-slate-600 text-center">QR Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-slate-800">{t.ticket_code}</td>
                      <td className="py-3 pr-4 text-slate-700">
                        {t.event?.title || `Event #${t.event_id}`}
                      </td>
                      <td className="py-3 pr-4 text-slate-700 font-medium">
                        {Number(t.price_paid) === 0
                          ? 'Free'
                          : `$${Number(t.price_paid).toFixed(2)}`}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                      </td>
                      <td className="py-3 text-xs text-slate-500 pr-4">{formatDate(t.purchased_at)}</td>
                      <td className="py-3 text-center">
                        <QRCodeImage text={t.ticket_code} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'check-in' && isStaff && (
        <div className="max-w-md">
          <Card title="Ticket Check-in Verification" subtitle="Enter ticket code to verify attendee admission">
            <form onSubmit={handleCheckIn} className="space-y-4">
              <Input
                label="Ticket Code"
                name="ticketCode"
                placeholder="e.g. TKT-xxxxxxxx"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                helperText="Enter the unique alphanumeric ticket code"
              />
              <Button type="submit" variant="primary" loading={checkInLoading} className="w-full">
                Verify and Check In
              </Button>

              {checkInMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{checkInMessage}</span>
                </div>
              )}
              {checkInError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{checkInError}</span>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}

      {/* Buy Ticket Modal */}
      <Modal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        title="Get Event Admission Ticket"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setBuyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={buying} onClick={handleBuyTicket}>
              Confirm Registration
            </Button>
          </>
        }
      >
        <form onSubmit={handleBuyTicket} className="space-y-4">
          {buyError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
              {buyError}
            </div>
          )}
          {eventOptions.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming events available for ticketing.</p>
          ) : (
            <Select
              label="Select Event"
              name="event"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              options={[{ value: '', label: 'Choose an event...' }, ...eventOptions]}
              required
            />
          )}
        </form>
      </Modal>
    </div>
  );
}
