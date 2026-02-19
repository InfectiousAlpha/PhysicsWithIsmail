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
    
    // Attempt to sign in
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result.error) {
      setError('Invalid credentials');
    } else {
      router.push('/'); // Redirect to home on success
      router.refresh();
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 style={{textAlign: 'center', marginBottom: '10px'}}>Admin Access</h2>
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
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
      </form>
    </div>
  );
}
