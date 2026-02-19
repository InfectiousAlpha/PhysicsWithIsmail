'use client';

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })} 
      className="submit-btn"
      style={{marginTop: '2rem', backgroundColor: '#dc2626'}}
    >
      Log Out
    </button>
  );
}
