import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_ROLES } from '../src/demoAccounts';
import authService from '../services/auth';
import { Zap, ChevronDown, Check, UserCheck, Shield } from 'lucide-react';

export default function DemoRoleSwitcher({ variant = 'header', onSelectRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const currentUser = authService.getUser() || {};
  const currentRole = (currentUser.role || '').toLowerCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDemo = async (demoAccount) => {
    setLoadingRole(demoAccount.role);
    try {
      if (onSelectRole) {
        onSelectRole(demoAccount);
      } else {
        await authService.login({
          email: demoAccount.email,
          password: demoAccount.password,
        });
        setIsOpen(false);
        // Navigate or hard reload to refresh all active queries and permissions
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Demo switch failed:', err);
    } finally {
      setLoadingRole(null);
      setIsOpen(false);
    }
  };

  if (variant === 'auth-buttons') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Fast Demo Access (1-Click)
          </span>
          <span className="text-[11px] text-slate-400">Click any role to enter</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {DEMO_ROLES.map((demo) => {
            const isCurrent = currentRole === demo.role;
            const isLoading = loadingRole === demo.role;
            return (
              <button
                key={demo.role}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectDemo(demo)}
                className={`p-2.5 text-left rounded-lg border text-xs transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-sky-500 bg-sky-50/70 ring-1 ring-sky-500 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    {demo.badgeText}
                  </span>
                  {isLoading ? (
                    <span className="text-[10px] text-sky-600 animate-pulse font-medium">Entering...</span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600">
                      {demo.role}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{demo.tagline}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">{demo.email}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Header dropdown variant
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors shadow-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
        <span>Demo Switcher</span>
        <ChevronDown className={`w-3.5 h-3.5 text-sky-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white shadow-xl ring-1 ring-black/10 z-50 divide-y divide-slate-100 border border-slate-200 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-3 bg-slate-50/80 rounded-t-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                Select Demo Role
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                Fast Access
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Switch roles in 1 click to test permissions & workflows
            </p>
          </div>

          <div className="p-1.5 space-y-1 max-h-80 overflow-y-auto">
            {DEMO_ROLES.map((demo) => {
              const isSelected = currentRole === demo.role;
              const isLoading = loadingRole === demo.role;
              return (
                <button
                  key={demo.role}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectDemo(demo)}
                  className={`w-full text-left p-2 rounded-md text-xs transition-colors flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-sky-50 text-sky-900 font-medium'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{demo.badgeText}</span>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{demo.description}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{demo.email}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />}
                  {isLoading && <span className="text-[10px] text-sky-600 animate-pulse mt-0.5">Switching...</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

