import React from 'react';
import Card from '../components/Card';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: October 2026</p>
      </div>

      <Card>
        <div className="prose prose-slate max-w-none space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            Student_OS values your privacy. This policy outlines how we handle student data, membership records, event registrations, and order details within our organization management system.
          </p>

          <h3 className="text-base font-semibold text-slate-900 pt-2">1. Information We Collect</h3>
          <p>
            We collect student contact information including full name, student email address, student ID, department, and graduation year during account registration and member roster setup.
          </p>

          <h3 className="text-base font-semibold text-slate-900 pt-2">2. Event and Ticketing Data</h3>
          <p>
            When registering for events, unique ticket identifiers and QR codes are generated to verify attendance. Attendance timestamps are stored for organization participation tracking.
          </p>

          <h3 className="text-base font-semibold text-slate-900 pt-2">3. Merchandise and Order Records</h3>
          <p>
            Order details, selected merchandise items, and delivery preferences are recorded to fulfill student orders. Payment references are recorded for treasury accounting purposes.
          </p>

          <h3 className="text-base font-semibold text-slate-900 pt-2">4. Data Access and Security</h3>
          <p>
            Access to member rosters, financial records, and organization settings is strictly restricted to authorized student organization officers and administrators based on assigned system roles.
          </p>
        </div>
      </Card>
    </div>
  );
}
