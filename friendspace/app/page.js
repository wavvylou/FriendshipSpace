import { createClient } from '../lib/supabaseServer';

export default async function Home() {
  const supabase = createClient();

  const [{ data: dumps }, { data: challenges }, { data: meetups }] = await Promise.all([
    supabase.from('dumps').select('*').order('created_at', { ascending: false }).limit(3),
    supabase.from('challenges').select('*').order('created_at', { ascending: false }).limit(3),
    supabase.from('meetups').select('*').order('starts_at', { ascending: true }).limit(3),
  ]);

  return (
    <div>
      <h1>What's new</h1>
      <p>The latest dumps, challenges, and plans from the group.</p>

      <h2 style={{ marginTop: '2rem' }}>Recent photo dumps</h2>
      {(dumps ?? []).length === 0 && <p>No dumps yet — start one from the Dumps tab.</p>}
      {(dumps ?? []).map((dump) => (
        <div className="card" key={dump.id}>
          <span className="tag">{dump.type}</span>
          <h3 style={{ marginTop: '0.5rem' }}>{dump.title}</h3>
          <p>{dump.period_start} → {dump.period_end}</p>
        </div>
      ))}

      <h2 style={{ marginTop: '2rem' }}>Open challenges</h2>
      {(challenges ?? []).length === 0 && <p>No challenges yet — start one from the Challenges tab.</p>}
      {(challenges ?? []).map((c) => (
        <div className="card" key={c.id}>
          <h3>{c.title}</h3>
          <p>{c.prompt}</p>
        </div>
      ))}

      <h2 style={{ marginTop: '2rem' }}>Coming up</h2>
      {(meetups ?? []).length === 0 && <p>Nothing scheduled — plan something from the Schedule tab.</p>}
      {(meetups ?? []).map((m) => (
        <div className="card" key={m.id}>
          <span className="tag">{m.kind === 'video_call' ? 'Video call' : 'In person'}</span>
          <h3 style={{ marginTop: '0.5rem' }}>{m.title}</h3>
          <p>{new Date(m.starts_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
