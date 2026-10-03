import React from 'react';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';

export default function Fundraisers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fundraisers</h1>
        <p className="text-sm text-slate-500">Charity drives, equipment funds, and organization sponsorship campaigns.</p>
      </div>

      <Card>
        <EmptyState
          title="No active fundraising campaigns"
          description="There are no ongoing fundraising campaigns at this time. When new drives or scholarship funds are initiated, they will be listed here."
        />
      </Card>
    </div>
  );
}
