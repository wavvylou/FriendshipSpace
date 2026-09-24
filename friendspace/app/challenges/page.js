'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabaseClient';
import PhotoUploader from '../../components/PhotoUploader';

export default function ChallengesPage() {
  const supabase = createClient();
  const [challenges, setChallenges] = useState([]);
  const [active, setActive] = useState(null);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ title: '', prompt: '', color_hex: '#4c7a72', start_date: '', end_date: '' });

  const load = async () => {
    const { data } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });
    setChallenges(data ?? []);
  };

  const loadEntries = async (challengeId) => {
    const { data } = await supabase
      .from('challenge_submissions')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false });
    setEntries(data ?? []);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (active) loadEntries(active.id); }, [active]);

  const createChallenge = async () => {
    if (!form.title || !form.prompt || !form.start_date || !form.end_date) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('challenges')
      .insert({ ...form, created_by: user.id })
      .select()
      .single();
    if (!error) {
      setChallenges([data, ...challenges]);
      setActive(data);
      setForm({ title: '', prompt: '', color_hex: '#4c7a72', start_date: '', end_date: '' });
    }
  };

  const submitEntry = async (url) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('challenge_submissions')
      .insert({ challenge_id: active.id, user_id: user.id, photo_url: url })
      .select()
      .single();
    if (!error) setEntries([data, ...entries]);
    else alert('You may have already submitted for this challenge.');
  };

  return (
    <div>
      <h1>Challenges</h1>
      <p>Colour hunts and other photo prompts — one submission each.</p>

      <div className="card">
        <input placeholder="Title (e.g. Colour Hunt: Teal)" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Prompt (e.g. Find something teal today)" style={{ marginTop: '0.5rem' }}
          value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
          <input type="color" style={{ width: '3rem' }} value={form.color_hex}
            onChange={(e) => setForm({ ...form, color_hex: e.target.value })} />
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        </div>
        <button style={{ marginTop: '0.75rem' }} onClick={createChallenge}>Start a challenge</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        {challenges.map((c) => (
          <button key={c.id} className={c.id === active?.id ? '' : 'secondary'} onClick={() => setActive(c)}>
            {c.title}
          </button>
        ))}
      </div>

      {active && (
        <>
          <p><strong>{active.prompt}</strong> · {active.start_date} → {active.end_date}</p>
          <PhotoUploader label="Submit your photo" onUploaded={submitEntry} />
          <div className="grid" style={{ marginTop: '1rem' }}>
            {entries.map((e) => (
              <div className="photo-tile" key={e.id}>
                <img src={e.photo_url} alt="" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
