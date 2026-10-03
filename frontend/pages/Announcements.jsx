import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import announcementsService from '../services/announcements';
import Badge from '../components/Badge';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementsService.getAnnouncements().then(data => {
      setAnnouncements(data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
        <p className="text-sm text-slate-500">Official bulletins and notices for organization members.</p>
      </div>

      {loading ? (
        <Card><Loading message="Loading announcements..." /></Card>
      ) : announcements.length === 0 ? (
        <Card>
          <EmptyState
            title="No announcements published yet"
            description="There are currently no active announcements from organization officers. Check back later for campus notices and general meeting reminders."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id} className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-slate-800">{a.title}</h3>
                {a.priority === 'high' || a.priority === 'urgent' ? (
                  <Badge variant="danger">{a.priority}</Badge>
                ) : (
                  <Badge variant="info">{a.priority}</Badge>
                )}
              </div>
              <p className="text-sm text-slate-600">{a.content}</p>
              <div className="text-xs text-slate-400 mt-2">
                Published: {new Date(a.created_at).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
