import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Loading from '../components/Loading';
import authService from '../services/auth';
import { User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getCurrentUser();
      const currentUser = data || authService.getUser() || { name: 'User', role: 'Member' };
      setUser(currentUser);
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setRole(currentUser.role || 'Member');
      setPhone(currentUser.phone || '');
    } catch {
      const fallback = authService.getUser() || { name: 'User', role: 'Member' };
      setUser(fallback);
      setName(fallback.name || '');
      setEmail(fallback.email || '');
      setRole(fallback.role || 'Member');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updated = { ...user, name, email, role, phone };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading profile information..." />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500">Manage account information, contact details, and organization role</p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card title="Account Overview">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xl">
            {name ? name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{name || 'Organization User'}</span>
              <Badge variant="info">{role}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">{email || 'No email attached'}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Select
              label="Organization Role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'Member', label: 'Member' },
                { value: 'Volunteer', label: 'Volunteer' },
                { value: 'Treasurer', label: 'Treasurer' },
                { value: 'Admin', label: 'Admin / President' },
              ]}
              helperText="Switch role to preview role-based features"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

