import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import eventsService from '../services/events';
import authService from '../services/auth';
import { Calendar, Plus, Edit, Trash2, AlertCircle, MapPin, Clock } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusVariant = (s) => {
  const m = { upcoming: 'info', ongoing: 'success', completed: 'secondary', cancelled: 'danger' };
  return m[s] || 'secondary';
};

const initialForm = {
  title: '',
  description: '',
  location: '',
  event_date: '',
  end_date: '',
  max_capacity: '',
  ticket_price: '0',
  status: 'upcoming',
};

const toInputDatetime = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

const formatDisplay = (iso) => {
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

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const user = authService.getUser() || {};
  const isAdmin = (user.role || '').toLowerCase().includes('admin');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventsService.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to load events.';
      setError(typeof msg === 'string' ? msg : 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditEvent(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditEvent(event);
    setForm({
      title: event.title || '',
      description: event.description || '',
      location: event.location || '',
      event_date: toInputDatetime(event.event_date),
      end_date: toInputDatetime(event.end_date),
      max_capacity: event.max_capacity ?? '',
      ticket_price: event.ticket_price ?? '0',
      status: event.status || 'upcoming',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        max_capacity: form.max_capacity ? parseInt(form.max_capacity, 10) : null,
        ticket_price: parseFloat(form.ticket_price) || 0,
        status: form.status,
      };
      if (editEvent) {
        await eventsService.updateEvent(editEvent.id, payload);
      } else {
        await eventsService.createEvent(payload);
      }
      setModalOpen(false);
      await fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Save failed.';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventsService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Delete failed.';
      alert(typeof msg === 'string' ? msg : 'Delete failed.');
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-sm text-slate-500">Organization events, meetings, and activities</p>
        </div>
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> Create Event
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Loading message="Loading events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6 text-slate-400" />}
          title="No events found"
          description="No data available yet."
          actionText={isAdmin ? 'Create Event' : undefined}
          onAction={isAdmin ? openAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900 leading-snug">{event.title}</h3>
                  <Badge variant={statusVariant(event.status)}>{event.status}</Badge>
                </div>

                {event.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2">{event.description}</p>
                )}

                <div className="space-y-1 mt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatDisplay(event.event_date)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500 space-x-3">
                  {event.max_capacity && (
                    <span>Capacity: {event.max_capacity}</span>
                  )}
                  <span className="font-medium text-slate-700">
                    Ticket: {Number(event.ticket_price) === 0 ? 'Free' : `$${Number(event.ticket_price).toFixed(2)}`}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(event)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                      aria-label="Edit event"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(event.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editEvent ? 'Edit Event' : 'Create New Event'}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
              {editEvent ? 'Save Changes' : 'Create Event'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
              {formError}
            </div>
          )}
          <Input
            label="Event Title"
            name="title"
            required
            placeholder="e.g. Annual General Meeting"
            value={form.title}
            onChange={handleChange('title')}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Event details..."
              value={form.description}
              onChange={handleChange('description')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <Input
            label="Location"
            name="location"
            placeholder="e.g. Main Auditorium"
            value={form.location}
            onChange={handleChange('location')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date and Time"
              name="event_date"
              type="datetime-local"
              required
              value={form.event_date}
              onChange={handleChange('event_date')}
            />
            <Input
              label="End Date and Time"
              name="end_date"
              type="datetime-local"
              value={form.end_date}
              onChange={handleChange('end_date')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Capacity"
              name="max_capacity"
              type="number"
              placeholder="Leave blank for unlimited"
              value={form.max_capacity}
              onChange={handleChange('max_capacity')}
            />
            <Input
              label="Ticket Price ($)"
              name="ticket_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0 for free"
              value={form.ticket_price}
              onChange={handleChange('ticket_price')}
            />
          </div>
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange('status')}
            options={STATUS_OPTIONS}
          />
        </form>
      </Modal>
    </div>
  );
}
