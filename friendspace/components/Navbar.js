'use client';

import Link from 'next/link';
import { createClient } from '../lib/supabaseClient';

export default function Navbar() {
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <header className="navbar">
      {/* Swap this text for an <img src="/logo.png" /> once your real logo & name are ready */}
      <Link href="/" className="brand">PlaceholderApp</Link>
      <nav>
        <Link href="/">Feed</Link>
        <Link href="/album">Album</Link>
        <Link href="/dumps">Dumps</Link>
        <Link href="/challenges">Challenges</Link>
        <Link href="/schedule">Schedule</Link>
        <button className="secondary" onClick={signOut}>Sign out</button>
      </nav>
    </header>
  );
}
