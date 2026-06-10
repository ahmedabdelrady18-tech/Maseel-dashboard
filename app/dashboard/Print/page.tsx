'use client';

import { useDashboardData, pct } from '@/components/DataClient';

function formatValue(value: any) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

export default function PrintReport() {
  const { data, error, loading } = useDashboardData();

  if (loading) return <p>Loading report...</p>;
  if (error) return <p className="error">{error}</p>;

  const project = data.projectInfo || {};
  const overall = data.overall || {};
  const phases = data.phases || [];
  const delays = data.delays || [];
  const risks = data.risks || [];
  const photos = data.photos || [];

  const criticalRisks = risks.filter((r: any) =>
    String(r['Risk Level'] || '').toLowerCase().includes('high')
  );

  return (
    <div className="print-report">
      <div className="print-cover">
        <h1>{project['Project Name'] || 'MASEEL MIXED-USE DEVELOPMENT'}</h1>
        <h2>Executive Project Dashboard Report</h2>
        <p>Contractor: {project.Contractor || 'AlEnshaiah'}</p>
        <p>Client: {project.Client || 'Oroub Investment Company'}</p>
        <p>Consultant: {project.Consultant || 'Saudi Diyar Consultants'}</p>

        <button className="print-action" onClick={() => window.print()}>
          Export / Save as PDF
        </button>
      </div>

      <section className="print-page">
        <h2>1. Executive Summary</h2>

        <div className="print-kpi-grid">
          <div>
            <span>Planned Progress</span>
            <strong>{pct(overall['Planned %'])}</strong>
          </div>
          <div>
            <span>Actual Progress</span>
            <strong>{pct(overall['Actual %'])}</strong>
          </div>
          <div>
            <span>Variance</span>
            <strong>{pct(overall['Variance %'])}</strong>
          </div>
          <div>
            <span>Overall SPI</span>
            <strong>{Number(overall.SPI || 0).toFixed(2)}</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>BL Finish</th>
              <th>Forecast Finish</th>
              <th>Finish Variance</th>
              <th>Remaining Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{formatValue(overall['BL Finish Date'])}</td>
              <td>{formatValue(overall['Forecast Finish Date'])}</td>
              <td>{formatValue(overall['Variance Finish Date'])} Days</td>
              <td>{formatValue(overall['Remaining Time'])} Days</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="print-page">
        <h2>2. Phase Progress</h2>

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
            {phases.map((p: any, i: number) => (
              <tr key={i}>
                <td>{formatValue(p.Phase)}</td>
                <td>{pct(p['Planned %'])}</td>
                <td>{pct(p['Actual %'])}</td>
                <td>{pct(p.Variance)}</td>
                <td>{Number(p.SPI || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-page">
        <h2>3. Delays & Recovery</h2>

        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>BL Finish</th>
              <th>Forecast</th>
              <th>Variance</th>
              <th>Reason</th>
              <th>Recovery</th>
              <th>Responsible</th>
            </tr>
          </thead>
          <tbody>
            {delays.map((d: any, i: number) => (
              <tr key={i}>
                <td>{formatValue(d['Phase Delay/Ahead'])}</td>
                <td>{formatValue(d['BL Finish Date'])}</td>
                <td>{formatValue(d['Forecast Finish Date'])}</td>
                <td>{formatValue(d['Variance Finish Date'])}</td>
                <td>{formatValue(d['Delay Reason'])}</td>
                <td>{formatValue(d['Recovery Action'])}</td>
                <td>{formatValue(d.Responsible)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-page">
        <h2>4. High Risks</h2>

        <table>
          <thead>
            <tr>
              <th>Risk ID</th>
              <th>Description</th>
              <th>Impact Summary</th>
              <th>Risk Level</th>
              <th>Owner</th>
              <th>Mitigation</th>
            </tr>
          </thead>
          <tbody>
            {criticalRisks.map((r: any, i: number) => (
              <tr key={i}>
                <td>{formatValue(r['Risk ID'])}</td>
                <td>{formatValue(r['Risk Description'])}</td>
                <td>{formatValue(r['Impact Summary'])}</td>
                <td>{formatValue(r['Risk Level'])}</td>
                <td>{formatValue(r['Risk Owner'])}</td>
                <td>{formatValue(r.Mitigation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-page">
        <h2>5. Site Photos</h2>

        <div className="print-photo-grid">
          {photos.map((p: any, i: number) => (
            <div className="print-photo-card" key={i}>
              <img src={p['Photo URL']} alt="Site Photo" />
              <h3>{formatValue(p.Phase)}</h3>
              <p>{formatValue(p.Date || p['Photo Date'])}</p>
              <p>{formatValue(p.Description || p.Notes)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}