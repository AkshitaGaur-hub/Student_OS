import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import api from '../services/api';
import authService from '../services/auth';
import { HeartHandshake, Plus, AlertCircle, DollarSign, CheckSquare } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
];

const initialFundraiserForm = { title: '', description: '', goal_amount: '', status: 'active' };

const statusVariant = (s) => {
  const m = { active: 'success', completed: 'info', paused: 'warning' };
  return m[s] || 'secondary';
};

export default function Fundraisers() {
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialFundraiserForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const user = authService.getUser() || {};
  const role = (user.role || '').toLowerCase();
  const canManage = role.includes('admin') || role.includes('organizer') || role.includes('treasurer');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/fundraisers');
      setFundraisers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load fundraisers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        goal_amount: form.goal_amount ? parseFloat(form.goal_amount) : null,
        status: form.status,
      };
      await api.post('/fundraisers', payload);
      setModalOpen(false);
      setForm(initialFundraiserForm);
      await fetchAll();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Save failed.';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (v) => {
    if (v == null) return 'No target';
    return `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fundraisers</h1>
          <p className="text-sm text-slate-500">Charity drives, equipment funds, and sponsorship campaigns.</p>
        </div>
        {canManage && (
          <Button variant="primary" size="sm" onClick={() => { setForm(initialFundraiserForm); setFormError(''); setModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New Fundraiser
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <Loading message="Loading fundraisers..." />
      ) : fundraisers.length === 0 ? (
        <Card>
          <EmptyState
            title="No active fundraising campaigns"
            description="No campaigns at this time. Admins can launch a new fundraiser."
            actionText={canManage ? 'Create Fundraiser' : undefined}
            onAction={canManage ? () => setModalOpen(true) : undefined}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fundraisers.map((f) => (
            <div key={f.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-rose-500 shrink-0" />
                  <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
                </div>
                <Badge variant={statusVariant(f.status)}>{f.status}</Badge>
              </div>
              {f.description && <p className="text-sm text-slate-500 line-clamp-2">{f.description}</p>}
              <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Goal: <span className="font-medium ml-1">{formatCurrency(f.goal_amount)}</span>
                </span>
                {f.amount_raised != null && (
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-green-500" />
                    Raised: <span className="font-medium ml-1">{formatCurrency(f.amount_raised)}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Fundraiser"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">{formError}</div>}
          <Input
            label="Campaign Title"
            name="title"
            required
            placeholder="e.g. Annual Scholarship Fund"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Campaign details..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <Input
            label="Goal Amount ($)"
            name="goal_amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 5000"
            value={form.goal_amount}
            onChange={(e) => setForm((p) => ({ ...p, goal_amount: e.target.value }))}
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            options={STATUS_OPTIONS}
          />
        </form>
      </Modal>
    </div>
  );
}

