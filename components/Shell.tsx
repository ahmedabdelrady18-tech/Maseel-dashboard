'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';
    setTheme(savedTheme);
    document.body.classList.toggle('light-theme', savedTheme === 'light');
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('dashboard-theme', nextTheme);
    document.body.classList.toggle('light-theme', nextTheme === 'light');
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }

  const logoBox = {
    height: 62,
    minWidth: 210,
    padding: '8px 18px',
    borderRadius: 16,
    background: 'rgba(79,195,247,0.08)',
    border: '1px solid rgba(79,195,247,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div>
          <div className="brand">Project Dashboard</div>

          <nav className="nav">
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/dashboard/progress">Progress</Link>
  <Link href="/dashboard/activities">Activities</Link>
  <Link href="/dashboard/lookahead">3 Week Look Ahead</Link>
  <Link href="/dashboard/delays">Delays</Link>
  <Link href="/dashboard/risks">Risks</Link>
  <Link href="/dashboard/photos">Photos</Link>
  <Link href="/dashboard/Print">Print Report</Link>
</nav>
        </div>

        <div className="theme-switch">
  <button onClick={toggleTheme}>
    <span>
      {theme === 'dark'
        ? 'Switch to Light Mode'
        : 'Switch to Dark Mode'}
    </span>

    <div className="theme-icon">
      {theme === 'dark' ? '☀️' : '🌙'}
    </div>
  </button>
</div>
      </aside>

      <main className="content">
        <div
          className="topbar"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 24,
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={logoBox}>
              <Image
                src="/Contractor Logo.png"
                alt="Contractor Logo"
                width={180}
                height={55}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={logoBox}>
              <Image
                src="/Client Logo.png"
                alt="Client Logo"
                width={180}
                height={55}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 22,
            }}
          >
            <div style={logoBox}>
              <Image
                src="/Consultant Logo.png"
                alt="Consultant Logo"
                width={180}
                height={55}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
<button className="btn print-btn" onClick={() => window.print()}>
  Export PDF
</button>
                <button className="btn" onClick={logout}>
                Logout
                </button>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}