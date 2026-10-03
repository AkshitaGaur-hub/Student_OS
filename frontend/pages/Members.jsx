import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import membersService from '../services/members';
import authService from '../services/auth';
import { Users, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';

const MEMBERSHIP_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'alumni', label: 'Alumni' },
];

const statusVariant = (s) => {
  if (s === 'active') return 'success';
  if (s === 'alumni') return 'info';
  return 'secondary';
};

const initialForm = {
  student_id: '',
  department: '',
  year_of_study: '',
  phone: '',
  membership_status: 'active',
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const user = authService.getUser() || {};
  const role = (user.role || '').toLowerCase();
  const isAdmin = role.includes('admin');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await membersService.getMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to load members.';
      setError(typeof msg === 'string' ? msg : 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditMember(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditMember(member);
    setForm({
      student_id: member.student_id || '',
      department: member.department || '',
      year_of_study: member.year_of_study || '',
      phone: member.phone || '',
      membership_status: member.membership_status || 'active',
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
        student_id: form.student_id,
        department: form.department || null,
        year_of_study: form.year_of_study ? parseInt(form.year_of_study, 10) : null,
        phone: form.phone || null,
        membership_status: form.membership_status,
      };
      if (editMember) {
        await membersService.updateMember(editMember.id, payload);
      } else {
        await membersService.createMember(payload);
      }
      setModalOpen(false);
      await fetchMembers();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Save failed.';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this member? This action cannot be undone.')) return;
    try {
      await membersService.deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
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
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="text-sm text-slate-500">Organization membership registry</p>
        </div>
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Member
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        {loading ? (
          <Loading message="Loading members..." />
        ) : members.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No members registered"
            description="No data available yet."
            actionText={isAdmin ? 'Add First Member' : undefined}
            onAction={isAdmin ? openAdd : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Student ID</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Department</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Year</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Phone</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Status</th>
                  <th className="pb-3 font-semibold text-slate-600">Joined</th>
                  {isAdmin && <th className="pb-3 pl-4 font-semibold text-slate-600 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-slate-800">{m.student_id}</td>
                    <td className="py-3 pr-4 text-slate-700">{m.department || '--'}</td>
                    <td className="py-3 pr-4 text-slate-700">{m.year_of_study || '--'}</td>
                    <td className="py-3 pr-4 text-slate-700">{m.phone || '--'}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusVariant(m.membership_status)}>
                        {m.membership_status}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">
                      {m.joined_at
                        ? new Date(m.joined_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '--'}
                    </td>
                    {isAdmin && (
                      <td className="py-3 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(m)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                            aria-label="Edit member"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            aria-label="Delete member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMember ? 'Edit Member' : 'Add New Member'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
              {editMember ? 'Save Changes' : 'Add Member'}
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
            label="Student ID"
            name="student_id"
            required
            placeholder="e.g. STU-2024-001"
            value={form.student_id}
            onChange={handleChange('student_id')}
          />
          <Input
            label="Department"
            name="department"
            placeholder="e.g. Computer Science"
            value={form.department}
            onChange={handleChange('department')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Year of Study"
              name="year_of_study"
              type="number"
              placeholder="e.g. 2"
              value={form.year_of_study}
              onChange={handleChange('year_of_study')}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={form.phone}
              onChange={handleChange('phone')}
            />
          </div>
          <Select
            label="Membership Status"
            name="membership_status"
            value={form.membership_status}
            onChange={handleChange('membership_status')}
            options={MEMBERSHIP_STATUS_OPTIONS}
          />
        </form>
      </Modal>
    </div>
  );
}
