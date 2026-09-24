'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabaseClient';
import PhotoUploader from '../../components/PhotoUploader';

export default function AlbumPage() {
  const supabase = createClient();
  const [albums, setAlbums] = useState([]);
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  const loadAlbums = async () => {
    const { data } = await supabase.from('albums').select('*').order('created_at', { ascending: false });
    setAlbums(data ?? []);
    if (data?.length && !activeAlbum) setActiveAlbum(data[0]);
  };

  const loadPhotos = async (albumId) => {
    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId)
      .order('created_at', { ascending: false });
    setPhotos(data ?? []);
  };

  useEffect(() => { loadAlbums(); }, []);
  useEffect(() => { if (activeAlbum) loadPhotos(activeAlbum.id); }, [activeAlbum]);

  const createAlbum = async () => {
    if (!newTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('albums')
      .insert({ title: newTitle, owner_id: user.id })
      .select()
      .single();
    if (!error) {
      setNewTitle('');
      setAlbums([data, ...albums]);
      setActiveAlbum(data);
    }
  };

  const addPhoto = async (url) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('photos')
      .insert({ album_id: activeAlbum.id, uploader_id: user.id, url })
      .select()
      .single();
    if (data) setPhotos([data, ...photos]);
  };

  return (
    <div>
      <h1>Digital album</h1>
      <p>A retro, film-strip take on our shared photo albums.</p>

      <div className="card">
        <input
          placeholder="New album name (e.g. Summer '26)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button style={{ marginTop: '0.75rem' }} onClick={createAlbum}>Create album</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        {albums.map((a) => (
          <button
            key={a.id}
            className={a.id === activeAlbum?.id ? '' : 'secondary'}
            onClick={() => setActiveAlbum(a)}
          >
            {a.title}
          </button>
        ))}
      </div>

      {activeAlbum && (
        <>
          <PhotoUploader label="Add photo to this album" onUploaded={addPhoto} />
          <div className="film-strip" style={{ marginTop: '1rem' }}>
            {photos.length === 0 && (
              <p style={{ color: 'white', padding: '1rem' }}>No photos in this album yet.</p>
            )}
            {photos.map((p) => (
              <div className="frame" key={p.id}>
                <img src={p.url} alt={p.caption ?? ''} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
