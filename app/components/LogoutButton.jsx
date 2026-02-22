'use client';

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })} 
      className="submit-btn"
      style={{ backgroundColor: '#ef4444', width: 'auto', padding: '0.5rem 1rem' }}
    >
      Log Out
    </button>
  );
}
