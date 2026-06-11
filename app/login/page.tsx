'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) router.push('/dashboard');
    else setError('Wrong password');
  }

  return (
    <div className="login-page">
      <form className="login-card premium-login-card" onSubmit={submit}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
          <Image
            src="/Contractor Logo.png"
            alt="AlEnshaiah Logo"
            width={230}
            height={80}
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>

        <h1>Project Dashboard Login</h1>

        <p className="small">Enter dashboard password to continue.</p>

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button className="btn" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}