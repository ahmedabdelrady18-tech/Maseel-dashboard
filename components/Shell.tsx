'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';

    setTheme(savedTheme);
    document.body.classList.toggle('light-theme', savedTheme === 'light');

    return () => {
      document.body.classList.remove('light-theme');
    };
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(nextTheme);
    localStorage.setItem('dashboard-theme', nextTheme);
    document.body.classList.toggle('light-theme', nextTheme === 'light');
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  }

  const navItems = [
    ['/dashboard', 'Dashboard'],
    ['/dashboard/progress', 'Progress'],
    ['/dashboard/activities', 'Activities'],
    ['/dashboard/lookahead', '3 Week Look Ahead'],
    ['/dashboard/delays', 'Delays'],
    ['/dashboard/risks', 'Risks'],
    ['/dashboard/photos', 'Photos'],
    ['/dashboard/print', 'Print Report'],
    ['/dashboard/walkthrough', '3D Walkthrough'],
  ];

  const logoStrip: CSSProperties = {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: 24,
    padding: '6px 0 18px',
    marginBottom: 6,
    background: 'transparent',
    border: 0,
    boxShadow: 'none',
  };

  const logoFloat: CSSProperties = {
    height: 58,
    minWidth: 190,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 0,
    boxShadow: 'none',
    position: 'relative',
    isolation: 'isolate',
  };

  const logoHalo: CSSProperties = {
    position: 'absolute',
    inset: '8px 6px',
    borderRadius: 999,
    background:
      'radial-gradient(circle, rgba(186,209,223,.18), rgba(98,214,255,.08) 45%, transparent 72%)',
    filter: 'blur(10px)',
    opacity: 0.8,
    zIndex: -1,
    animation: 'logoAura 5.5s ease-in-out infinite',
  };

  const logoImage: CSSProperties = {
    objectFit: 'contain',
    filter:
      'drop-shadow(0 8px 16px rgba(0,0,0,.28)) drop-shadow(0 0 10px rgba(186,209,223,.14))',
    animation: 'logoFloatWave 7s ease-in-out infinite',
    transformOrigin: '50% 50%',
  };

  const actionButton: CSSProperties = {
    height: 42,
    padding: '0 20px',
    borderRadius: 999,
    border: '1px solid rgba(98,214,255,.35)',
    background:
      'linear-gradient(135deg, rgba(98,214,255,.95), rgba(51,181,229,.86))',
    color: '#061525',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 12px 25px rgba(0,0,0,.18), 0 0 18px rgba(98,214,255,.20)',
  };

  return (
    <div className="layout">
      <style>{`
        @keyframes logoFloatWave {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-2px) rotate(-0.45deg) scale(1.01);
          }
          50% {
            transform: translateY(1px) rotate(0.35deg) scale(1);
          }
          75% {
            transform: translateY(-1px) rotate(0.25deg) scale(1.008);
          }
        }

        @keyframes logoAura {
          0%, 100% {
            opacity: .45;
            transform: scale(.96);
          }
          50% {
            opacity: .9;
            transform: scale(1.08);
          }
        }

        .floating-logo:hover img {
          transform: translateY(-3px) scale(1.045) !important;
          filter: drop-shadow(0 12px 20px rgba(0,0,0,.34)) drop-shadow(0 0 14px rgba(98,214,255,.25)) !important;
          animation-play-state: paused;
        }
      `}</style>

      <aside className="sidebar">
        <div>
          <div className="brand">Project Dashboard</div>

          <nav className="nav">
            {navItems.map(([href, label]) => {
              const active =
                href === '/dashboard'
                  ? pathname === href
                  : pathname?.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    background: active ? 'rgba(98,214,255,.12)' : undefined,
                    color: active ? '#62D6FF' : undefined,
                    borderLeft: active ? '3px solid #62D6FF' : undefined,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="theme-switch">
          <button type="button" onClick={toggleTheme}>
            <span>
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </span>

            <div className="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</div>
          </button>
        </div>
      </aside>

      <main className="content">
        <div className="topbar" style={logoStrip}>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div className="floating-logo" style={logoFloat}>
              <span style={logoHalo} />
              <Image
                src="/Contractor Logo.png"
                alt="Contractor Logo"
                width={172}
                height={48}
                priority
                style={logoImage}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="floating-logo" style={{ ...logoFloat, minWidth: 175 }}>
              <span style={logoHalo} />
              <Image
                src="/Client Logo.png"
                alt="Client Logo"
                width={158}
                height={44}
                priority
                style={{ ...logoImage, animationDelay: '1.2s' }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div className="floating-logo" style={logoFloat}>
              <span style={logoHalo} />
              <Image
                src="/Consultant Logo.png"
                alt="Consultant Logo"
                width={172}
                height={48}
                priority
                style={{ ...logoImage, animationDelay: '2.1s' }}
              />
            </div>

            <button
              type="button"
              onClick={() => router.push('/dashboard/print')}
              style={actionButton}
            >
              Export PDF
            </button>

            <button
              type="button"
              onClick={logout}
              style={{
                ...actionButton,
                background:
                  'linear-gradient(135deg, rgba(98,214,255,.86), rgba(186,209,223,.72))',
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}