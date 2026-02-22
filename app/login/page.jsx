'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result.error) {
      setError('Invalid credentials');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 style={{textAlign: 'center', marginBottom: '10px', color: 'var(--dark-blue)', fontSize: '1.5rem', fontWeight: 'bold'}}>
          Physics Academy
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="submit-btn">Login</button>
        {error && <p style={{color: '#ef4444', textAlign: 'center', fontSize: '0.9rem'}}>{error}</p>}
      </form>
    </div>
  );
}
