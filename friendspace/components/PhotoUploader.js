'use client';

import { useState } from 'react';
import { createClient } from '../lib/supabaseClient';

// Uploads a file to the public "photos" bucket and returns its public URL.
// onUploaded(url) is called once the file is up.
export default function PhotoUploader({ onUploaded, label = 'Add a photo' }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${crypto.randomUUID()}-${file.name}`;

    const { error } = await supabase.storage.from('photos').upload(path, file);
    if (error) {
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    onUploaded(data.publicUrl);
    setUploading(false);
  };

  return (
    <label className="button" style={{ display: 'inline-block' }}>
      {uploading ? 'Uploading…' : label}
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
        disabled={uploading}
      />
    </label>
  );
}
