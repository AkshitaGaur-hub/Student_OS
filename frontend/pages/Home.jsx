import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Calendar,
  Ticket,
  ShoppingBag,
  DollarSign,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import authService from '../services/auth';

const features = [
  {
    icon: Users,
    title: 'Member Management',
    description: 'Register members, track departments, years of study, and membership status.',
  },
  {
    icon: Calendar,
    title: 'Events',
    description: 'Create and manage organization events. Set capacity, ticket pricing, and status.',
  },
  {
    icon: Ticket,
    title: 'Ticketing and Check-in',
    description: 'Issue event tickets with unique codes. Staff can verify attendance at the check-in desk.',
  },
  {
    icon: ShoppingBag,
    title: 'Merchandise Store',
    description: 'Manage organization merchandise inventory and process member orders.',
  },
  {
    icon: DollarSign,
    title: 'Finance Tracking',
    description: 'Record income and expenses, manage reimbursement requests, and view budget summaries.',
  },
];

export default function Home() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="pt-10 pb-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-sky-700 mb-4">
          <GraduationCap className="w-8 h-8" />
          <span className="text-sm font-semibold tracking-wide uppercase">Student_OS</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
          Student Organization Management System
        </h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto">
          A management platform for student organizations. Handle membership, events, tickets, merchandise, and finances in one place.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-medium rounded-md hover:bg-sky-700 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-medium rounded-md hover:bg-sky-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Features */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Platform Capabilities</h2>
          <p className="text-sm text-slate-500 mt-2">
            Everything a student organization needs to operate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
              >
                <div className="w-10 h-10 bg-sky-50 rounded-md flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-sky-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border border-slate-200 rounded-lg bg-slate-50 p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to get started?</h2>
        <p className="text-sm text-slate-600 mb-6">
          Sign in with your organization account to access the dashboard.
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-medium rounded-md hover:bg-sky-700 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign In to Dashboard
        </Link>
      </section>
    </div>
  );
}
