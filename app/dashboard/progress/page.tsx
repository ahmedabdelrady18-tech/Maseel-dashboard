'use client';

import { pct, useDashboardData } from '@/components/DataClient';

function spiStatus(spi: number) {
  if (spi >= 0.95) return 'On Track';
  if (spi >= 0.8) return 'Watch';
  return 'Critical';
}

function barWidth(value: number) {
  const percent = value <= 1 ? value * 100 : value;
  return `${Math.min(Math.max(percent, 0), 100)}%`;
}

export default function Progress() {
  const { data, error, loading } = useDashboardData();

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <h1>Phase Progress Dashboard</h1>

      <div className="phase-grid section">
        {data.phases.map((r: any) => {
          const planned = Number(r['Planned %'] || 0);
          const actual = Number(r['Actual %'] || 0);
          const variance = Number(r.Variance || 0);
          const spi = Number(r.SPI || 0);
          const status = spiStatus(spi);

          return (
            <div className="phase-card" key={r.Phase}>
              <div className="phase-card-head">
                <h2>{r.Phase}</h2>
                <span
                  className={`spi-badge ${
                    status === 'Critical'
                      ? 'badge-red'
                      : status === 'Watch'
                      ? 'badge-yellow'
                      : 'badge-green'
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="metric">
                <div className="metric-top">
                  <span>Planned Progress</span>
                  <strong>{pct(planned)}</strong>
                </div>

                <div className="bar">
                  <div
                    className="bar-fill planned"
                    style={{ width: barWidth(planned) }}
                  />
                </div>
              </div>

              <div className="metric">
                <div className="metric-top">
                  <span>Actual Progress</span>
                  <strong>{pct(actual)}</strong>
                </div>

                <div className="bar">
                  <div
                    className="bar-fill actual"
                    style={{ width: barWidth(actual) }}
                  />
                </div>
              </div>

              <div className="phase-bottom">
                <div>
                  <span>Variance</span>
                  <strong className={variance < 0 ? 'status-bad' : 'status-good'}>
                    {pct(variance)}
                  </strong>
                </div>

                <div>
                  <span>SPI</span>
                  <strong
                    className={
                      spi < 0.8
                        ? 'status-bad'
                        : spi < 0.95
                        ? 'status-watch'
                        : 'status-good'
                    }
                  >
                    {spi.toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Progress Details</h2>

      <div className="table-wrap section">
        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Planned</th>
              <th>Actual</th>
              <th>Variance</th>
              <th>SPI</th>
            </tr>
          </thead>

          <tbody>
            {data.phases.map((r: any) => (
              <tr key={r.Phase}>
                <td>{r.Phase}</td>
                <td>{pct(r['Planned %'])}</td>
                <td>{pct(r['Actual %'])}</td>
                <td className={Number(r.Variance) < 0 ? 'status-bad' : 'status-good'}>
                  {pct(r.Variance)}
                </td>
                <td>{Number(r.SPI || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}