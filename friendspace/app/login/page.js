'use client';

import { createClient } from '../../lib/supabaseClient';

export default function Login() {
  const supabase = createClient();

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  return (
    <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1>PlaceholderApp</h1>
      <p>Photo dumps, challenges, and plans — just us.</p>
      <button onClick={signInWithGoogle} style={{ marginTop: '1.5rem' }}>
        Continue with Google
      </button>
    </div>
  );
}
