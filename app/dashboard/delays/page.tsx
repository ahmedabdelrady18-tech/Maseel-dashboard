'use client';

import { useDashboardData } from '@/components/DataClient';

function formatValue(value: any) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

export default function Delays() {
  const { data, error, loading } = useDashboardData();

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  const rows = data.delays || [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const phaseRows = rows.filter(
    (r: any) => String(r['Phase Delay/Ahead'] || '').toLowerCase() !== 'overall'
  );

  const criticalCount = phaseRows.filter(
    (r: any) => Number(r['Variance Finish Date']) <= -30
  ).length;

  const avgDelay =
    phaseRows.length > 0
      ? Math.round(
          phaseRows.reduce(
            (sum: number, r: any) =>
              sum + Math.abs(Number(r['Variance Finish Date']) || 0),
            0
          ) / phaseRows.length
        )
      : 0;

  const worstPhase =
    phaseRows.length > 0
      ? phaseRows.reduce((a: any, b: any) =>
          Number(a['Variance Finish Date']) < Number(b['Variance Finish Date']) ? a : b
        )
      : null;

  const maxDelay = Math.max(
    ...phaseRows.map((r: any) => Math.abs(Number(r['Variance Finish Date']) || 0)),
    1
  );

  function getSeverity(delay: number) {
    if (delay <= -50) return { label: 'Critical', className: 'status-bad' };
    if (delay <= -30) return { label: 'Major', className: 'status-watch' };
    if (delay <= -15) return { label: 'Moderate', className: 'status-watch' };
    return { label: 'Minor', className: 'status-good' };
  }

  return (
    <>
      <h1>Delays & Recovery</h1>

      <div className="activity-summary-grid section">
        <div className="activity-summary-card">
          <span>Total Phases</span>
          <strong>{phaseRows.length}</strong>
        </div>

        <div className="activity-summary-card">
          <span>Critical Phases</span>
          <strong className="status-bad">{criticalCount}</strong>
        </div>

        <div className="activity-summary-card">
          <span>Average Delay</span>
          <strong className="status-watch">{avgDelay} Days</strong>
        </div>

        <div className="activity-summary-card">
          <span>Worst Phase</span>
          <strong className="status-bad">
            {worstPhase?.['Phase Delay/Ahead'] || '-'}
          </strong>
        </div>
      </div>

      <div className="card section">
        <h2>Delay Severity Overview</h2>

        {phaseRows.map((r: any, i: number) => {
          const delay = Math.abs(Number(r['Variance Finish Date']) || 0);
          const width = (delay / maxDelay) * 100;

          return (
            <div
              key={i}
              style={{
                marginTop: '18px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <strong>{formatValue(r['Phase Delay/Ahead'])}</strong>
                <span className="status-bad">{delay} Days</span>
              </div>

              <div className="bar">
                <div
                  className="bar-fill planned"
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="table-wrap section">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th>Severity</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row: any, i: number) => {
              const delay = Number(row['Variance Finish Date'] || 0);
              const severity = getSeverity(delay);

              return (
                <tr key={i}>
                  {columns.map((col) => (
                    <td
                      key={col}
                      className={
                        col === 'Variance Finish Date' && delay < 0 ? 'status-bad' : ''
                      }
                    >
                      {formatValue(row[col])}
                    </td>
                  ))}

                  <td className={severity.className}>{severity.label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}