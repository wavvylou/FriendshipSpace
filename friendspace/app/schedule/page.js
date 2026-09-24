'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabaseClient';

export default function SchedulePage() {
  const supabase = createClient();
  const [meetups, setMeetups] = useState([]);
  const [rsvps, setRsvps] = useState({}); // meetup_id -> status for current user
  const [form, setForm] = useState({ title: '', kind: 'in_person', starts_at: '', location_or_link: '' });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('meetups').select('*').order('starts_at', { ascending: true });
    setMeetups(data ?? []);

    const { data: mine } = await supabase.from('meetup_rsvps').select('*').eq('user_id', user.id);
    const map = {};
    (mine ?? []).forEach((r) => { map[r.meetup_id] = r.status; });
    setRsvps(map);
  };

  useEffect(() => { load(); }, []);

  const createMeetup = async () => {
    if (!form.title || !form.starts_at) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('meetups')
      .insert({ ...form, created_by: user.id })
      .select()
      .single();
    if (!error) {
      setMeetups([...meetups, data].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)));
      setForm({ title: '', kind: 'in_person', starts_at: '', location_or_link: '' });
    }
  };

  const rsvp = async (meetupId, status) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('meetup_rsvps').upsert({ meetup_id: meetupId, user_id: user.id, status });
    setRsvps({ ...rsvps, [meetupId]: status });
  };

  return (
    <div>
      <h1>Schedule</h1>
      <p>Meet-ups and video calls, with an RSVP so you know who's actually coming.</p>

      <div className="card">
        <input placeholder="What's the plan?" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select style={{ marginTop: '0.5rem' }} value={form.kind}
          onChange={(e) => setForm({ ...form, kind: e.target.value })}>
          <option value="in_person">In person</option>
          <option value="video_call">Video call</option>
        </select>
        <input type="datetime-local" style={{ marginTop: '0.5rem' }} value={form.starts_at}
          onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
        <input
          placeholder={form.kind === 'video_call' ? 'Call link' : 'Location'}
          style={{ marginTop: '0.5rem' }}
          value={form.location_or_link}
          onChange={(e) => setForm({ ...form, location_or_link: e.target.value })}
        />
        <button style={{ marginTop: '0.75rem' }} onClick={createMeetup}>Add to schedule</button>
      </div>

      {meetups.map((m) => (
        <div className="card" key={m.id}>
          <span className="tag">{m.kind === 'video_call' ? 'Video call' : 'In person'}</span>
          <h3 style={{ marginTop: '0.5rem' }}>{m.title}</h3>
          <p>{new Date(m.starts_at).toLocaleString()}</p>
          {m.location_or_link && <p>{m.location_or_link}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {['going', 'maybe', 'cant_go'].map((status) => (
              <button
                key={status}
                className={rsvps[m.id] === status ? '' : 'secondary'}
                onClick={() => rsvp(m.id, status)}
              >
                {status === 'going' ? "I'm in" : status === 'maybe' ? 'Maybe' : "Can't go"}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
