'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabaseClient';
import PhotoUploader from '../../components/PhotoUploader';

export default function DumpsPage() {
  const supabase = createClient();
  const [dumps, setDumps] = useState([]);
  const [active, setActive] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({ type: 'weekly', title: '', period_start: '', period_end: '' });

  const load = async () => {
    const { data } = await supabase.from('dumps').select('*').order('created_at', { ascending: false });
    setDumps(data ?? []);
  };

  const loadPhotos = async (dumpId) => {
    const { data } = await supabase
      .from('dump_photos')
      .select('photo_id, photos(*)')
      .eq('dump_id', dumpId);
    setPhotos((data ?? []).map((row) => row.photos));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (active) loadPhotos(active.id); }, [active]);

  const createDump = async () => {
    if (!form.title || !form.period_start || !form.period_end) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('dumps')
      .insert({ ...form, created_by: user.id })
      .select()
      .single();
    if (!error) {
      setDumps([data, ...dumps]);
      setActive(data);
      setForm({ type: 'weekly', title: '', period_start: '', period_end: '' });
    }
  };

  const addPhoto = async (url) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: photo } = await supabase
      .from('photos')
      .insert({ uploader_id: user.id, url })
      .select()
      .single();
    if (photo) {
      await supabase.from('dump_photos').insert({ dump_id: active.id, photo_id: photo.id });
      setPhotos([photo, ...photos]);
    }
  };

  return (
    <div>
      <h1>Photo dumps</h1>
      <p>Weekly and monthly rounds-ups — everyone adds their photos in.</p>

      <div className="card">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <input
          placeholder="Title (e.g. September Dump)"
          style={{ marginTop: '0.5rem' }}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} />
          <input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} />
        </div>
        <button style={{ marginTop: '0.75rem' }} onClick={createDump}>Start a dump</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        {dumps.map((d) => (
          <button key={d.id} className={d.id === active?.id ? '' : 'secondary'} onClick={() => setActive(d)}>
            {d.title}
          </button>
        ))}
      </div>

      {active && (
        <>
          <PhotoUploader label="Add photo to this dump" onUploaded={addPhoto} />
          <div className="grid" style={{ marginTop: '1rem' }}>
            {photos.map((p) => (
              <div className="photo-tile" key={p.id}>
                <img src={p.url} alt="" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
