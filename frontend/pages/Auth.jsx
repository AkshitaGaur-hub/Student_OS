
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import authService from '../services/auth';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        await authService.register({ name, email, password, role });
        setSuccess('Account registered successfully. Redirecting...');
      } else {
        await authService.login({ email, password });
        setSuccess('Authentication successful. Redirecting...');
      }
      setTimeout(() => {
        navigate('/dashboard');
      }, 400);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please check your credentials or API connection.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-900">
          {isRegister ? 'Register Account' : 'Sign in to Student_OS'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isRegister
            ? 'Enter your details below to create your student account'
            : 'Enter your credentials to access your organization workspace'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <Input
              label="Full Name"
              name="name"
              type="text"
              required
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Select
              label="Organization Role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'MEMBER', label: 'Member' },
                { value: 'VOLUNTEER', label: 'Volunteer' },
                { value: 'TREASURER', label: 'Treasurer' },
                { value: 'ADMIN', label: 'Admin / President' },
              ]}
            />
          </>
        )}

        <Input
          label="Email Address"
          name="email"
          type="email"
          required
          placeholder="student@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
          {isRegister ? 'Register Account' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
            setSuccess('');
          }}
          className="font-semibold text-sky-600 hover:text-sky-700 underline"
        >
          {isRegister ? 'Sign in' : 'Create an account'}
        </button>
      </div>
    </div>
  );
}
