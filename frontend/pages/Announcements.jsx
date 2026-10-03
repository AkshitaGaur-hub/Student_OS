import React from 'react';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';

export default function Announcements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
        <p className="text-sm text-slate-500">Official bulletins and notices for organization members.</p>
      </div>

      <Card>
        <EmptyState
          title="No announcements published yet"
          description="There are currently no active announcements from organization officers. Check back later for campus notices and general meeting reminders."
        />
      </Card>
    </div>
  );
}
