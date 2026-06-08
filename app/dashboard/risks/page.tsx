'use client';

import { useState } from 'react';
import { useDashboardData } from '@/components/DataClient';

function formatValue(value: any) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function riskBadgeClass(value: any) {
  const text = String(value || '').toLowerCase();

  if (text.includes('high')) return 'risk-badge-high';
  if (text.includes('medium')) return 'risk-badge-medium';
  if (text.includes('low')) return 'risk-badge-low';

  return '';
}

export default function Risks() {
  const { data, error, loading } = useDashboardData();
  const [riskFilter, setRiskFilter] = useState('all');

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  const allRows = data.risks || [];

  const highRisks = allRows.filter((r: any) =>
    String(r['Risk Level'] || '').toLowerCase().includes('high')
  ).length;

  const mediumRisks = allRows.filter((r: any) =>
    String(r['Risk Level'] || '').toLowerCase().includes('medium')
  ).length;

  const lowRisks = allRows.filter((r: any) =>
    String(r['Risk Level'] || '').toLowerCase().includes('low')
  ).length;

  const rows = allRows.filter((r: any) => {
    const level = String(r['Risk Level'] || '').toLowerCase();

    if (riskFilter === 'high') return level.includes('high');
    if (riskFilter === 'medium') return level.includes('medium');
    if (riskFilter === 'low') return level.includes('low');

    return true;
  });

  const columns = rows.length > 0 ? Object.keys(rows[0]) : Object.keys(allRows[0] || {});

  return (
    <>
      <h1>Issues & Risks</h1>

      <div className="activity-summary-grid section">
        <button
          className={`activity-summary-card clickable-card ${riskFilter === 'all' ? 'active-filter' : ''}`}
          onClick={() => setRiskFilter('all')}
        >
          <span>All Risks</span>
          <strong>{allRows.length}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${riskFilter === 'high' ? 'active-filter' : ''}`}
          onClick={() => setRiskFilter('high')}
        >
          <span>High</span>
          <strong className="status-bad">{highRisks}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${riskFilter === 'medium' ? 'active-filter' : ''}`}
          onClick={() => setRiskFilter('medium')}
        >
          <span>Medium</span>
          <strong className="status-watch">{mediumRisks}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${riskFilter === 'low' ? 'active-filter' : ''}`}
          onClick={() => setRiskFilter('low')}
        >
          <span>Low</span>
          <strong className="status-good">{lowRisks}</strong>
        </button>
      </div>

      <p className="small section">
        Current Filter: <strong>{riskFilter}</strong> | Showing {rows.length} of {allRows.length} risks
      </p>

      <div className="table-wrap section risks-table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row: any, i: number) => (
              <tr key={i}>
                {columns.map((col) => {
                  const isRiskColored =
                    col === 'Risk Level' || col === 'Probability' || col === 'Impact';

                  return (
                    <td key={col}>
                      {isRiskColored ? (
                        <span className={riskBadgeClass(row[col])}>
                          {formatValue(row[col])}
                        </span>
                      ) : (
                        formatValue(row[col])
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}