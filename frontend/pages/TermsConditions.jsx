import React from 'react';
import Card from '../components/Card';

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Terms & Conditions</h1>
        <p className="text-sm text-slate-500">Last updated: October 2026</p>
      </div>

      <Card>
        <div className="prose prose-slate max-w-none space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            By accessing or using the Student_OS platform, you agree to comply with and be bound by the following
            terms and conditions governing membership, event ticketing, and merchandise orders.
          </p>

          <h3 className="text-base font-semibold text-slate-900 pt-2">1. Organization Membership</h3>
          <p>
            Membership is open to verified students. Members agree to follow campus code of conduct rules during
            all organized activities and within the platform workspace.
          </p>

          <h3 className="text-base font-semibold text-slate-900 pt-2">2. Event Tickets & Check-in</h3>
          <p>
            Event tickets issued through the system are unique to the registered attendee. Ticket codes must be
            presented at the check-in desk for event entrance. Duplicate or unauthorized transfer of tickets is not permitted.
          </p>

          <h3 className="text-base font-semibold text-slate-900 pt-2">3. Merchandise & Orders</h3>
          <p>
            Orders placed through the merchandise store are subject to available inventory. Pickup and delivery
            timelines are managed by designated student organization volunteers.
          </p>

          <h3 className="text-base font-semibold text-slate-900 pt-2">4. Treasury & Reimbursements</h3>
          <p>
            All reimbursement claims submitted by volunteers must be accompanied by valid payment receipts
            and approved by the organization Treasurer.
          </p>
        </div>
      </Card>
    </div>
  );
}
