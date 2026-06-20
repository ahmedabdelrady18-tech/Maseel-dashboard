'use client';

import { useDashboardData, pct } from '@/components/DataClient';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ReferenceLine,
  LabelList,
} from 'recharts';

const BRAND = {
  primary: '#4C5B70',
  secondary: '#4A7385',
  light: '#BAD1DF',
  dark: '#102A3D',
  blue: '#2563eb',
  cyan: '#0284c7',
  green: '#16a34a',
  yellow: '#f59e0b',
  red: '#dc2626',
};

function formatValue(value: any) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function isCritical(value: any) {
  return String(value || '').toLowerCase() === 'yes';
}

function formatMonth(value: any) {
  const text = String(value || '');
  if (text.includes('-')) {
    const parts = text.split('-');
    if (parts.length === 3) return `${parts[1]}-${parts[2]}`;
  }
  return text;
}

function daysBetween(start: any, finish: any) {
  const s = new Date(start);
  const f = new Date(finish);

  if (isNaN(s.getTime()) || isNaN(f.getTime())) return 0;

  return Math.round((f.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function phaseRiskScore(phase: any) {
  const spi = Number(phase.SPI || 0);
  const variance = Math.abs(Number(phase.Variance || 0));
  return (spi > 0 ? (1 - spi) * 100 : 100) + variance * 100;
}

function SCurvePrint({ data }: any) {
  const chartData = (data || []).map((x: any) => ({
    month: formatMonth(x.month),
    planned: Number(x.planned || 0) * 100,
    actual: x.actual === null ? null : Number(x.actual || 0) * 100,
    cumPlanned: Number(x.cumPlanned || 0) * 100,
    cumActual: x.cumActual === null ? null : Number(x.cumActual || 0) * 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={390}>
      <ComposedChart data={chartData} margin={{ top: 38, right: 35, left: 10, bottom: 15 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d7e3ec" />
        <XAxis dataKey="month" stroke="#334155" tick={{ fontSize: 10 }} />
        <YAxis stroke="#334155" tickFormatter={(v) => `${v}%`} />
        <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)}%`} />
        <Legend />

        <Bar dataKey="planned" fill="#60a5fa" opacity={0.35} name="Monthly Planned %" />
        <Bar dataKey="actual" fill={BRAND.green} opacity={0.7} name="Monthly Actual %" />

        <Line
          type="monotone"
          dataKey="cumPlanned"
          stroke={BRAND.cyan}
          strokeWidth={3}
          dot={{ r: 3 }}
          name="Cumulative Planned %"
        >
          <LabelList
            dataKey="cumPlanned"
            position="top"
            formatter={(v: any) => `${Number(v).toFixed(0)}%`}
            fill={BRAND.cyan}
            fontSize={10}
            fontWeight={700}
          />
        </Line>

        <Line
          type="monotone"
          dataKey="cumActual"
          stroke={BRAND.green}
          strokeWidth={3}
          dot={{ r: 3 }}
          connectNulls={false}
          name="Cumulative Actual %"
        >
          <LabelList
            dataKey="cumActual"
            position="top"
            formatter={(v: any) =>
              v === null || v === undefined ? '' : `${Number(v).toFixed(0)}%`
            }
            fill={BRAND.green}
            fontSize={10}
            fontWeight={700}
          />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function SPITrendPrint({ data }: any) {
  const chartData = (data || [])
    .filter((row: any) => row.spi !== null && row.spi !== undefined && row.spi !== '')
    .map((row: any) => ({
      month: formatMonth(row.month),
      spi: Number(row.spi || 0),
    }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <AreaChart data={chartData} margin={{ top: 40, right: 30, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d7e3ec" />
        <XAxis dataKey="month" stroke="#334155" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 1.3]} stroke="#334155" tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: any) => Number(v).toFixed(2)} />

        <ReferenceLine y={1} stroke={BRAND.green} strokeWidth={2} label={{ value: 'Target 1.00', fill: BRAND.green }} />
        <ReferenceLine y={0.9} stroke={BRAND.yellow} strokeDasharray="5 5" />

        <Area
          type="monotone"
          dataKey="spi"
          stroke={BRAND.cyan}
          fill="#93c5fd"
          fillOpacity={0.35}
          strokeWidth={3}
          dot={{ r: 4 }}
          name="SPI"
        >
          <LabelList
            dataKey="spi"
            position="top"
            formatter={(v: any) => Number(v).toFixed(2)}
            fill={BRAND.dark}
            fontSize={11}
            fontWeight={800}
          />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function PrintReport() {
  const { data, error, loading } = useDashboardData();

  if (loading) return <p>Loading report...</p>;
  if (error) return <p className="error">{error}</p>;

  const project = data.projectInfo || {};
  const overall = data.overall || {};
  const phases = data.phases || [];
  const activities = data.activities || [];
  const lookahead = data.lookahead || [];
  const delays = data.delays || [];
  const risks = data.risks || [];
  const photos = data.photos || [];

  const overallSpi = Number(overall.SPI || 0);
  const healthScore = Math.max(0, Math.min(100, Math.round(overallSpi * 100)));

  const projectHealth =
    overallSpi >= 0.95 ? 'HEALTHY' : overallSpi >= 0.9 ? 'WATCH' : 'CRITICAL';

  const onTrack = phases.filter((x: any) => Number(x.SPI || 0) >= 0.95).length;
  const warning = phases.filter(
    (x: any) => Number(x.SPI || 0) >= 0.9 && Number(x.SPI || 0) < 0.95
  ).length;
  const critical = phases.filter((x: any) => Number(x.SPI || 0) < 0.9).length;

  const mostCriticalPhase =
    [...phases].sort((a: any, b: any) => phaseRiskScore(b) - phaseRiskScore(a))[0] || null;

  const criticalRisks = risks.filter((r: any) =>
    String(r['Risk Level'] || '').toLowerCase().includes('high')
  );

  const criticalLookahead = lookahead.filter((r: any) => isCritical(r.Critical));
  const criticalActivities = activities.filter((r: any) => isCritical(r.Critical));

  const finishVarianceDays = daysBetween(
    overall['BL Finish Date'],
    overall['Forecast Finish Date']
  );

  return (
    <div className="print-report">
      <style>{`
        .print-report {
          background: #e8eef4;
          color: #0f172a;
          font-family: Arial, Helvetica, sans-serif;
          padding: 24px;
        }

        .print-cover,
        .print-page {
          background: white;
          border-radius: 18px;
          padding: 34px;
          margin: 0 auto 28px;
          max-width: 1180px;
          box-shadow: 0 20px 55px rgba(15, 23, 42, .12);
          border: 1px solid #dbe5ee;
          page-break-after: always;
        }

        .print-cover {
          min-height: 780px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .report-logo-box {
          height: 78px;
          width: 230px;
          border: 1px solid #d8e4ee;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }

        .report-logo-box img {
          max-height: 62px;
          max-width: 190px;
          object-fit: contain;
        }

        .cover-title {
          margin-top: 70px;
          border-left: 8px solid ${BRAND.secondary};
          padding-left: 26px;
        }

        .cover-title h1 {
          font-size: 48px;
          margin: 0;
          color: ${BRAND.primary};
          line-height: 1.1;
        }

        .cover-title h2 {
          font-size: 28px;
          margin: 14px 0 0;
          color: ${BRAND.secondary};
        }

        .cover-meta {
          margin-top: 45px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .cover-meta div {
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #dbe5ee;
          border-radius: 14px;
        }

        .cover-meta span,
        .print-kpi-grid span {
          display: block;
          text-transform: uppercase;
          color: ${BRAND.primary};
          font-size: 12px;
          letter-spacing: .7px;
          margin-bottom: 7px;
        }

        .cover-meta strong {
          font-size: 18px;
          color: #0f172a;
        }

        .print-page h2 {
          font-size: 24px;
          color: #020617;
          border-bottom: 4px solid #2563eb;
          padding-bottom: 10px;
          margin-top: 0;
        }

        .print-page h3 {
          color: ${BRAND.primary};
          font-size: 18px;
          margin-top: 22px;
        }

        .print-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin: 22px 0;
        }

        .print-kpi-grid div {
          border: 1px solid #d8e4ee;
          border-left: 5px solid #2563eb;
          border-radius: 14px;
          padding: 16px;
          background: #f8fafc;
          min-height: 72px;
        }

        .print-kpi-grid strong {
          font-size: 26px;
          color: #020617;
        }

        .status-healthy { color: ${BRAND.green} !important; }
        .status-watch { color: ${BRAND.yellow} !important; }
        .status-critical { color: ${BRAND.red} !important; }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 18px;
          font-size: 12px;
        }

        th {
          background: ${BRAND.dark};
          color: white;
          text-align: left;
          padding: 10px;
          border: 1px solid #ffffff33;
        }

        td {
          padding: 9px;
          border: 1px solid #dbe5ee;
          vertical-align: top;
        }

        tr:nth-child(even) td {
          background: #f8fafc;
        }

        .executive-note {
          background: #f8fafc;
          border: 1px solid #dbe5ee;
          border-left: 6px solid ${BRAND.secondary};
          border-radius: 14px;
          padding: 18px;
          line-height: 1.75;
        }

        .recovery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .recovery-grid div {
          border-radius: 14px;
          padding: 14px;
          background: #f8fafc;
          border: 1px solid #dbe5ee;
        }

        .recovery-grid strong {
          display: block;
          margin-top: 6px;
          font-size: 18px;
        }

        .print-photo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .print-photo-card {
          border: 1px solid #dbe5ee;
          border-radius: 16px;
          overflow: hidden;
          background: #f8fafc;
        }

        .print-photo-card img {
          width: 100%;
          height: 240px;
          object-fit: cover;
          display: block;
        }

        .print-photo-card h3,
        .print-photo-card p {
          margin-left: 14px;
          margin-right: 14px;
        }

        .print-action {
          margin-top: 45px;
          align-self: flex-start;
          background: #2563eb;
          color: white;
          border: 0;
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        @media print {
          body {
            background: white !important;
          }

          .print-report {
            background: white !important;
            padding: 0 !important;
          }

          .print-cover,
          .print-page {
            max-width: none;
            box-shadow: none;
            border-radius: 0;
            margin: 0;
            page-break-after: always;
          }

          .print-action {
            display: none !important;
          }
        }
      `}</style>

      <div className="print-cover">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="report-logo-box">
            <img src="/Contractor Logo.png" alt="Contractor Logo" />
          </div>
          <div className="report-logo-box">
            <img src="/Client Logo.png" alt="Client Logo" />
          </div>
          <div className="report-logo-box">
            <img src="/Consultant Logo.png" alt="Consultant Logo" />
          </div>
        </div>

        <div className="cover-title">
          <h1>{project['Project Name'] || 'MASEEL MIXED-USE DEVELOPMENT'}</h1>
          <h2>Executive Project Dashboard Report</h2>
        </div>

        <div className="cover-meta">
          <div><span>Contractor</span><strong>{project.Contractor || 'AlEnshaiah'}</strong></div>
          <div><span>Client</span><strong>{project.Client || 'Oroub Investment Company'}</strong></div>
          <div><span>Consultant</span><strong>{project.Consultant || 'Saudi Diyar Consultants'}</strong></div>
          <div><span>Report Date</span><strong>{new Date().toLocaleDateString()}</strong></div>
          <div><span>Prepared By</span><strong>Planning Department</strong></div>
          <div><span>Report Type</span><strong>Executive Dashboard Report</strong></div>
        </div>

        <button className="print-action" onClick={() => window.print()}>
          Export / Save as PDF
        </button>
      </div>

      <section className="print-page">
        <h2>1. Executive Dashboard Overview</h2>

        <div className="print-kpi-grid">
          <div><span>Project Health</span><strong>{healthScore}/100</strong></div>
          <div>
            <span>Health Status</span>
            <strong
              className={
                projectHealth === 'HEALTHY'
                  ? 'status-healthy'
                  : projectHealth === 'WATCH'
                  ? 'status-watch'
                  : 'status-critical'
              }
            >
              {projectHealth}
            </strong>
          </div>
          <div><span>Overall SPI</span><strong>{overallSpi.toFixed(2)}</strong></div>
          <div><span>Finish Variance</span><strong>{finishVarianceDays} Days</strong></div>
        </div>

        <div className="print-kpi-grid">
          <div><span>Planned Progress</span><strong>{pct(overall['Planned %'])}</strong></div>
          <div><span>Actual Progress</span><strong>{pct(overall['Actual %'])}</strong></div>
          <div><span>Variance</span><strong>{pct(overall['Variance %'])}</strong></div>
          <div><span>Most Critical Phase</span><strong>{mostCriticalPhase?.Phase || '-'}</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>BL Finish</th>
              <th>Forecast Finish</th>
              <th>Remaining Time</th>
              <th>Critical Phases</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{formatValue(overall['BL Finish Date'])}</td>
              <td>{formatValue(overall['Forecast Finish Date'])}</td>
              <td>{formatValue(overall['Remaining Time'])} Days</td>
              <td>{critical}</td>
            </tr>
          </tbody>
        </table>

        <h3>Executive Commentary</h3>
        <p className="executive-note">
          Project health is currently <b>{projectHealth}</b>. Overall SPI is{' '}
          <b>{overallSpi.toFixed(2)}</b>, with <b>{critical}</b> critical phase(s).
          The most critical area is <b>{mostCriticalPhase?.Phase || '-'}</b>.
          Acceleration, resource rebalancing, manpower enhancement and close weekly
          monitoring are required to protect the contractual dates.
        </p>
      </section>

      <section className="print-page">
        <h2>2. Project Masterplan</h2>
        <img
          src="/maseel-masterplan.jpg.png"
          alt="Maseel Masterplan"
          style={{
            width: '100%',
            maxHeight: 430,
            objectFit: 'contain',
            border: '1px solid #cbd5e1',
            borderRadius: 14,
          }}
        />

        <div className="print-kpi-grid" style={{ marginTop: 18 }}>
          <div><span>On Track</span><strong>{onTrack}</strong></div>
          <div><span>Warning</span><strong>{warning}</strong></div>
          <div><span>Critical</span><strong>{critical}</strong></div>
          <div><span>Total Phases</span><strong>{phases.length}</strong></div>
        </div>
      </section>

      <section className="print-page">
        <h2>3. S-Curve Overview</h2>
        <SCurvePrint data={data.sCurve} />
      </section>

      <section className="print-page">
        <h2>4. SPI Trend</h2>
        <SPITrendPrint data={data.spiTrend} />
      </section>

      <section className="print-page">
        <h2>5. Phase Progress</h2>
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
        <h2>6. 3 Week Look Ahead</h2>

        <div className="print-kpi-grid">
          <div><span>Total Look Ahead</span><strong>{lookahead.length}</strong></div>
          <div>
            <span>In Progress</span>
            <strong>{lookahead.filter((r: any) => String(r['Activity Status'] || '').toLowerCase().includes('progress')).length}</strong>
          </div>
          <div>
            <span>Not Started</span>
            <strong>{lookahead.filter((r: any) => String(r['Activity Status'] || '').toLowerCase().includes('not started')).length}</strong>
          </div>
          <div><span>Critical</span><strong>{criticalLookahead.length}</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Activity ID</th>
              <th>Activity Name</th>
              <th>Status</th>
              <th>Phase</th>
              <th>Start</th>
              <th>Finish</th>
              <th>Performance %</th>
              <th>Total Float</th>
              <th>Critical</th>
            </tr>
          </thead>
          <tbody>
            {lookahead.map((a: any, i: number) => (
              <tr key={i}>
                <td>{formatValue(a['Activity ID'])}</td>
                <td>{formatValue(a['Activity Name'])}</td>
                <td>{formatValue(a['Activity Status'])}</td>
                <td>{formatValue(a['02- Con.Phase'])}</td>
                <td>{formatValue(a.Start)}</td>
                <td>{formatValue(a.Finish)}</td>
                <td>{formatValue(a['Performance % Complete'])}</td>
                <td>{formatValue(a['Total Float'])}</td>
                <td>{formatValue(a.Critical)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-page">
        <h2>7. Critical Activities Summary</h2>

        <div className="print-kpi-grid">
          <div><span>Total Activities</span><strong>{activities.length}</strong></div>
          <div><span>Critical Activities</span><strong>{criticalActivities.length}</strong></div>
          <div>
            <span>Completed</span>
            <strong>{activities.filter((r: any) => String(r['Activity Status'] || '').toLowerCase().includes('complete')).length}</strong>
          </div>
          <div>
            <span>In Progress</span>
            <strong>{activities.filter((r: any) => String(r['Activity Status'] || '').toLowerCase().includes('progress')).length}</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Activity ID</th>
              <th>Activity Name</th>
              <th>Status</th>
              <th>Phase</th>
              <th>Start</th>
              <th>Finish</th>
              <th>Total Float</th>
              <th>Critical</th>
            </tr>
          </thead>
          <tbody>
            {criticalActivities.slice(0, 60).map((a: any, i: number) => (
              <tr key={i}>
                <td>{formatValue(a['Activity ID'])}</td>
                <td>{formatValue(a['Activity Name'])}</td>
                <td>{formatValue(a['Activity Status'])}</td>
                <td>{formatValue(a['02- Con.Phase'])}</td>
                <td>{formatValue(a.Start)}</td>
                <td>{formatValue(a.Finish)}</td>
                <td>{formatValue(a['Total Float'])}</td>
                <td>{formatValue(a.Critical)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-page">
        <h2>8. Delays & Recovery</h2>

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
                <td>{daysBetween(d['BL Finish Date'], d['Forecast Finish Date'])} Days</td>
                <td>{formatValue(d['Delay Reason'])}</td>
                <td>{formatValue(d['Recovery Action'])}</td>
                <td>{formatValue(d.Responsible)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-page">
        <h2>9. High Risks</h2>

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
        <h2>10. Site Photos</h2>

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

      <section className="print-page">
        <h2>11. Recovery Plan Summary</h2>

        <div className="recovery-grid">
          <div><span>Manpower Increase</span><strong style={{ color: BRAND.yellow }}>In Progress</strong></div>
          <div><span>Night Shift</span><strong style={{ color: BRAND.green }}>Activated</strong></div>
          <div><span>Resource Rebalancing</span><strong style={{ color: BRAND.red }}>Required</strong></div>
          <div><span>Weekly Monitoring</span><strong style={{ color: BRAND.green }}>Active</strong></div>
        </div>

        <p className="executive-note" style={{ marginTop: 18 }}>
          The Contractor has initiated schedule recovery measures through manpower
          increase, productivity enhancement, close progress monitoring, and resource
          optimization across critical work fronts. Recent performance indicates positive
          improvement trends, and the Contractor remains committed to minimizing schedule
          variance and recovering delays while maintaining quality and safety requirements.
        </p>
      </section>
    </div>
  );
}