import React, { useState } from 'react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Mock credentials for the preview environment
  const ADMIN_USER = "admin";
  const ADMIN_PASSWORD = "password123";

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials. Use admin / password123 for preview.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  if (isLoggedIn) {
    return (
      <div style={styles.container}>
        <h1 style={{fontSize: '4rem', fontWeight: 'bold'}}>you login</h1>
        
        <p style={{marginTop: '20px', fontSize: '1.5rem'}}>
          Hello, <span style={{color: '#0070f3', fontWeight: 'bold'}}>{username}</span>
        </p>
        
        <p style={{marginTop: '10px'}}>Welcome to your private dashboard.</p>
        
        <button 
          onClick={handleLogout} 
          style={{...styles.btn, backgroundColor: '#dc2626', marginTop: '2rem'}}
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={{textAlign: 'center', marginBottom: '20px', margin: 0}}>Admin Access</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.btn}>Login</button>
        {error && <p style={{color: 'red', textAlign: 'center', margin: 0, marginTop: '10px', fontSize: '0.9rem'}}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#f0f2f5',
    color: '#000',
    padding: '2rem'
  },
  form: {
    background: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%',
    maxWidth: '350px'
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
    outline: 'none'
  },
  btn: {
    background: '#0070f3',
    color: 'white',
    padding: '0.875rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background 0.2s'
  }
};
