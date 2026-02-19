'use client'; // This is required for buttons to work

import { signOut } from "next-auth/react";

export default function Home() {
  return (
    <div className="content-container">
      <h1 style={{fontSize: '4rem', fontWeight: 'bold'}}>you login</h1>
      <p style={{marginTop: '20px'}}>Welcome to your private dashboard.</p>
      
      <button 
        onClick={() => signOut({ callbackUrl: '/login' })} 
        className="submit-btn"
        style={{marginTop: '2rem', backgroundColor: '#dc2626'}} // Red color for logout
      >
        Log Out
      </button>
    </div>
  );
}
