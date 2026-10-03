import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import EmptyState from '../components/EmptyState';
import { Ticket, QrCode, CheckCircle2 } from 'lucide-react';

export default function Tickets() {
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [ticketCode, setTicketCode] = useState('');
  const [checkInStatus, setCheckInStatus] = useState(null);

  const handleCheckIn = (e) => {
    e.preventDefault();
    if (!ticketCode) return;
    setCheckInStatus('Ticket check-in processed. Ready for API verification.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tickets & Attendance</h1>
        <p className="text-sm text-slate-500">Manage event passes and QR check-in desk</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('my-tickets')}
          className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'my-tickets'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>My Tickets</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('check-in')}
          className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'check-in'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Check-in Desk</span>
        </button>
      </div>

      {activeTab === 'my-tickets' ? (
        <Card>
          <EmptyState
            icon={<Ticket className="w-6 h-6" />}
            title="No tickets purchased"
            description="When you register for events, your tickets with QR codes will appear here."
          />
        </Card>
      ) : (
        <div className="max-w-md">
          <Card title="Ticket Check-in Verification" subtitle="Enter or scan ticket barcode/code">
            <form onSubmit={handleCheckIn} className="space-y-4">
              <Input
                label="Ticket Code / UUID"
                name="ticketCode"
                placeholder="e.g. TKT-98234-A"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                helperText="Scan barcode or enter alphanumeric ticket code"
              />
              <Button type="submit" variant="primary" className="w-full">
                Verify & Check In
              </Button>

              {checkInStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{checkInStatus}</span>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
