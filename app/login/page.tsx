'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, accessCode }),
    });

    if (res.ok) router.replace('/dashboard');
    else setError('Invalid access type or password');
  }

  return (
    <div className="login-page">
      <form
        onSubmit={submit}
        style={{
          width: 520,
          background: '#153746',
          padding: 34,
          borderRadius: 22,
          border: '1px solid #38bdf8',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <Image
            src="/Contractor Logo.png"
            alt="AlEnshaiah Logo"
            width={230}
            height={80}
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>

        <h1 style={{ color: 'white', marginBottom: 12 }}>
          Project Dashboard Login
        </h1>

        <p style={{ color: '#cbd5e1' }}>
          Select your access type and enter password.
        </p>

        <input
          style={inputStyle}
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          style={inputStyle}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Access Type</option>
          <option value="ADMIN">ADMIN</option>
          <option value="CLIENT">CLIENT</option>
          <option value="CONSULTANT">CONSULTANT</option>
          <option value="CONTRACTOR_TEAM">CONTRACTOR TEAM</option>
        </select>

        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
        />

        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

        <button
          type="submit"
          style={{
            background: '#38bdf8',
            border: 0,
            borderRadius: 14,
            padding: '14px 36px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 54,
  margin: '12px 0',
  borderRadius: 14,
  border: '1px solid #cbd5e1',
  padding: '0 16px',
  fontSize: 16,
  background: '#eef5ff',
  color: '#0f172a',
  display: 'block',
};