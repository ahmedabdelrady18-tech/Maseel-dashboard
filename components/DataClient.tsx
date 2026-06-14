'use client';

import { useEffect, useState } from 'react';

export function useDashboardData() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/api/dashboard', {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`Dashboard API error: ${res.status}`);
        }

        const json = await res.json();

        if (json?.error) {
          throw new Error(json.error);
        }

        if (active) {
          setData(json);
        }
      } catch (err: any) {
        if (active) {
          setError(err?.message || 'Failed to load dashboard data');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  return {
    data,
    error,
    loading,
  };
}

export function pct(value: any) {
  const n = Number(value);

  if (!Number.isFinite(n)) return '0.00%';

  const percent = Math.abs(n) <= 1 ? n * 100 : n;

  return `${percent.toFixed(2)}%`;
}

export function num(value: any, digits = 2) {
  const n = Number(value);

  if (!Number.isFinite(n)) return String(value || '');

  return n.toFixed(digits);
}

export function safeText(value: any, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback;

  return String(value);
}

export function getStatusBySPI(spiValue: any) {
  const spi = Number(spiValue || 0);

  if (spi >= 1) return 'On Track';
  if (spi >= 0.9) return 'Warning';

  return 'Critical';
}

export function getStatusColorBySPI(spiValue: any) {
  const spi = Number(spiValue || 0);

  if (spi >= 1) return '#22c55e';
  if (spi >= 0.9) return '#facc15';

  return '#ef4444';
}