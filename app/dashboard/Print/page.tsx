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
} from 'recharts';

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

function phaseRiskScore(phase: any) {
  const spi = Number(phase.SPI || 0);
  const variance = Math.abs(Number(phase.Variance || 0));

  const spiRisk = spi > 0 ? (1 - spi) * 100 : 100;
  const varianceRisk = variance * 100;

  return spiRisk + varianceRisk;
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
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
        <XAxis dataKey="month" stroke="#334155" tick={{ fontSize: 11 }} />
        <YAxis stroke="#334155" tickFormatter={(v) => `${v}%`} />
        <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)}%`} />
        <Legend />
        <Bar dataKey="planned" fill="#38bdf8" opacity={0.45} name="Monthly Planned %" />
        <Bar dataKey="actual" fill="#22c55e" opacity={0.7} name="Monthly Actual %" />
        <Line
          type="monotone"
          dataKey="cumPlanned"
          stroke="#0284c7"
          strokeWidth={3}
          dot={false}
          name="Cumulative Planned %"
        />
        <Line
          type="monotone"
          dataKey="cumActual"
          stroke="#16a34a"
          strokeWidth={3}
          dot={{ r: 3 }}
          connectNulls={false}
          name="Cumulative Actual %"
        />
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
    <ResponsiveContainer width="100%" height={330}>
      <AreaChart data={chartData} margin={{ top: 20, right: 25, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
        <XAxis dataKey="month" stroke="#334155" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 1.3]} stroke="#334155" tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: any) => Number(v).toFixed(2)} />
        <ReferenceLine y={1} stroke="#16a34a" strokeWidth={2} />
        <ReferenceLine y={0.9} stroke="#f59e0b" strokeDasharray="5 5" />
        <Area
          type="monotone"
          dataKey="spi"
          stroke="#0284c7"
          fill="#38bdf8"
          fillOpacity={0.25}
          strokeWidth={3}
          dot={{ r: 4 }}
          name="SPI"
        />
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
    healthScore >= 95 ? 'HEALTHY' : healthScore >= 80 ? 'WATCH' : 'CRITICAL';

  const onTrack = phases.filter((x: any) => Number(x.SPI || 0) >= 1).length;
  const warning = phases.filter(
    (x: any) => Number(x.SPI || 0) >= 0.9 && Number(x.SPI || 0) < 1
  ).length;
  const critical = phases.filter((x: any) => Number(x.SPI || 0) < 0.9).length;

  const mostCriticalPhase =
    [...phases].sort((a: any, b: any) => phaseRiskScore(b) - phaseRiskScore(a))[0] || null;

  const criticalRisks = risks.filter((r: any) =>
    String(r['Risk Level'] || '').toLowerCase().includes('high')
  );

  const criticalLookahead = lookahead.filter((r: any) => isCritical(r.Critical));
  const criticalActivities = activities.filter((r: any) => isCritical(r.Critical));

  return (
    <div className="print-report">
      <div className="print-cover">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/Contractor Logo.png" alt="Contractor Logo" style={{ height: 60 }} />
          <img src="/Client Logo.png" alt="Client Logo" style={{ height: 60 }} />
          <img src="/Consultant Logo.png" alt="Consultant Logo" style={{ height: 60 }} />
        </div>

        <h1>{project['Project Name'] || 'MASEEL MIXED-USE DEVELOPMENT'}</h1>
        <h2>Executive Project Dashboard Report</h2>

        <p>Contractor: {project.Contractor || 'AlEnshaiah'}</p>
        <p>Client: {project.Client || 'Oroub Investment Company'}</p>
        <p>Consultant: {project.Consultant || 'Saudi Diyar Consultants'}</p>
        <p>Prepared By: Planning Department</p>
        <p>Report Date: {new Date().toLocaleDateString()}</p>

        <button className="print-action" onClick={() => window.print()}>
          Export / Save as PDF
        </button>
      </div>

      <section className="print-page">
        <h2>1. Executive Dashboard Overview</h2>

        <div className="print-kpi-grid">
          <div><span>Project Health</span><strong>{healthScore}/100</strong></div>
          <div><span>Health Status</span><strong>{projectHealth}</strong></div>
          <div><span>Overall SPI</span><strong>{overallSpi.toFixed(2)}</strong></div>
          <div><span>Finish Variance</span><strong>{formatValue(overall['Variance Finish Date'])} Days</strong></div>
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
        <p>
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

        <p>
          The Contractor has initiated schedule recovery measures through manpower
          increase, productivity enhancement, close progress monitoring, and resource
          optimization across critical work fronts.
        </p>

        <p>
          Recent performance indicates positive improvement trends, and the Contractor
          remains committed to minimizing schedule variance and recovering delays while
          maintaining quality and safety requirements.
        </p>
      </section>
    </div>
  );
}