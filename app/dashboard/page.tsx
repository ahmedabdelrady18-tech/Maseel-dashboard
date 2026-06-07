'use client';

import { pct, useDashboardData } from '@/components/DataClient';
import { useState, type CSSProperties } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
const SCurve = ({ data }: any) => {
  const chartData = (data || []).map((x: any) => ({
    month: String(x.month || '').slice(0, 7),
    planned: Number(x.planned || 0) * 100,
    actual: x.actual === null ? null : Number(x.actual || 0) * 100,
    cumPlanned: Number(x.cumPlanned || 0) * 100,
    cumActual: x.cumActual === null ? null : Number(x.cumActual || 0) * 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 10, right: 25, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
        <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
        <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
        <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)}%`} />
        <Legend />

        <Line
          type="monotone"
          dataKey="planned"
          stroke="#38bdf8"
          strokeWidth={2}
          dot={false}
          name="Monthly Planned %"
        />

        <Line
          type="monotone"
          dataKey="actual"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          name="Monthly Actual %"
        />

        <Line
          type="monotone"
          dataKey="cumPlanned"
          stroke="#ef4444"
          strokeWidth={4}
          dot={false}
          name="CUM Planned %"
        />

        <Line
          type="monotone"
          dataKey="cumActual"
          stroke="#a855f7"
          strokeWidth={4}
          dot={false}
          connectNulls={false}
          name="CUM Actual %"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
export default function Dashboard() {
  const { data, error, loading } = useDashboardData();
  const [selectedPhase, setSelectedPhase] = useState<any>(null);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  const o = data.overall || {};
  const p = data.projectInfo || {};
  const phases = data.phases || [];

  const phaseList = [
    { name: 'Phase-1', label: 'Phase 1', top: '22%', left: '53%' },
    { name: 'Phase-2', label: 'Phase 2', top: '70%', left: '40%' },
    { name: 'Phase-3', label: 'Phase 3', top: '35%', left: '62%' },
    { name: 'Phase-4', label: 'Phase 4', top: '50%', left: '44%' },
    { name: 'Phase-5', label: 'Phase 5', top: '10%', left: '73%' },
  ];

  const getPhaseData = (phaseName: string) =>
    phases.find((x: any) => x.Phase === phaseName) || null;

  const getPhaseColor = (phaseName: string) => {
    const spi = Number(getPhaseData(phaseName)?.SPI || 0);
    if (spi >= 1) return '#22c55e';
    if (spi >= 0.9) return '#facc15';
    return '#ef4444';
  };

  const getPhaseStatus = (phaseName: string) => {
    const spi = Number(getPhaseData(phaseName)?.SPI || 0);
    if (spi >= 1) return 'On Track';
    if (spi >= 0.9) return 'Warning';
    return 'Critical';
  };

  const total = phases.length;
  const onTrack = phases.filter((x: any) => Number(x.SPI || 0) >= 1).length;
  const warning = phases.filter(
    (x: any) => Number(x.SPI || 0) >= 0.9 && Number(x.SPI || 0) < 1
  ).length;
  const critical = phases.filter((x: any) => Number(x.SPI || 0) < 0.9).length;

  const overallSpi = Number(o.SPI || 0);
  const plannedProgress = Number(o['Planned %'] || 0);
  const actualProgress = Number(o['Actual %'] || 0);
  const varianceProgress = Number(o['Variance %'] || 0);

  const actualValue = Number(selectedPhase?.['Actual %'] || 0);
  const plannedValue = Number(selectedPhase?.['Planned %'] || 0);
  const spiValue = Number(selectedPhase?.SPI || 0);

  const mostCriticalPhase =
    [...phases].sort((a: any, b: any) => Number(a.SPI || 0) - Number(b.SPI || 0))[0] ||
    null;

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        overallSpi * 55 +
          actualProgress * 25 +
          Math.max(0, 1 + varianceProgress) * 20
      )
    )
  );

  const healthColor =
    healthScore >= 75 ? '#22c55e' : healthScore >= 55 ? '#facc15' : '#ef4444';

  const projectHealth =
    healthScore >= 75 ? 'HEALTHY' : healthScore >= 55 ? 'WATCH' : 'CRITICAL';

  const glassCard: CSSProperties = {
    padding: 14,
    minHeight: 92,
    background: 'linear-gradient(135deg, rgba(17,24,39,.92), rgba(8,23,38,.88))',
    border: '1px solid rgba(79,195,247,.18)',
    boxShadow: '0 8px 24px rgba(0,0,0,.25)',
    backdropFilter: 'blur(10px)',
    transition: 'all .2s ease',
  };

  const Sparkline = ({ color = '#38bdf8' }: any) => (
    <svg width="72" height="28" viewBox="0 0 72 28" fill="none">
      <path
        d="M2 22 L10 20 L18 17 L26 19 L34 9 L42 15 L50 13 L58 16 L70 12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 22 L10 20 L18 17 L26 19 L34 9 L42 15 L50 13 L58 16 L70 12 L70 28 L2 28 Z"
        fill={color}
        opacity="0.12"
      />
    </svg>
  );

  const MiniRing = ({ value, color }: any) => {
    const safeValue = Math.min(Number(value || 0), 1);

    return (
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: `conic-gradient(${color} ${safeValue * 100}%, #26364a 0)`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            width: 37,
            height: 37,
            borderRadius: '50%',
            background: '#111827',
            display: 'grid',
            placeItems: 'center',
            fontSize: 12,
            fontWeight: 800,
            color: 'white',
          }}
        >
          {Math.round(Number(value || 0) * 100)}%
        </div>
      </div>
    );
  };

  const Gauge = ({ value }: any) => {
    const max = 1.5;
    const safeValue = Math.min(Number(value || 0), max);
    const percent = (safeValue / max) * 100;
    const color =
      safeValue >= 1 ? '#22c55e' : safeValue >= 0.9 ? '#facc15' : '#ef4444';

    return (
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: `conic-gradient(${color} ${percent}%, #26364a ${percent}% 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 43,
            height: 43,
            borderRadius: '50%',
            background: '#081726',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>
            {safeValue.toFixed(2)}
          </div>
          <div style={{ fontSize: 8, color: '#94a3b8' }}>SPI</div>
        </div>
      </div>
    );
  };

  const MiniBars = () => (
    <div style={{ display: 'flex', alignItems: 'end', gap: 4, height: 38 }}>
      {[16, 23, 14, 30, 39, 25, 48].map((h, i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: h,
            borderRadius: 4,
            background: '#ef4444',
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );

  const DonutChart = () => {
    const safeTotal = Math.max(total, 1);
    const green = (onTrack / safeTotal) * 100;
    const yellow = (warning / safeTotal) * 100;
    const red = (critical / safeTotal) * 100;

    return (
      <div
        style={{
          width: 128,
          height: 128,
          borderRadius: '50%',
          background: `conic-gradient(#22c55e 0 ${green}%, #facc15 ${green}% ${
            green + yellow
          }%, #ef4444 ${green + yellow}% ${green + yellow + red}%, #26364a 0)`,
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: '50%',
            background: '#081726',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900 }}>{total}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>PHASES</div>
        </div>
      </div>
    );
  };

  const Scurve = () => (
    <svg width="100%" height="170" viewBox="0 0 520 170" fill="none">
      <line x1="35" y1="135" x2="500" y2="135" stroke="#334155" />
      <line x1="35" y1="20" x2="35" y2="135" stroke="#334155" />

      <path
        d="M45 130 C120 125, 160 105, 210 82 C280 50, 365 35, 490 28"
        stroke="#38bdf8"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M45 132 C120 130, 160 125, 210 112 C280 88, 365 78, 490 70"
        stroke="#22c55e"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      <text x="55" y="25" fill="#38bdf8" fontSize="12">Planned</text>
      <text x="55" y="45" fill="#22c55e" fontSize="12">Actual</text>
      <text x="405" y="155" fill="#94a3b8" fontSize="11">Reporting Timeline</text>
    </svg>
  );

  const ExecCard = ({ title, value, icon, color, trend, spark }: any) => (
    <div
      className="card"
      style={{
        ...glassCard,
        border: `1px solid ${color}44`,
        background: `linear-gradient(135deg, #111827 0%, #0b1626 72%, ${color}20 100%)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 10px 28px ${color}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.25)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div className="kpi-title">{title}</div>
          <div
            className="kpi-value"
            style={{ color, fontSize: 28, marginTop: 7, lineHeight: 1 }}
          >
            {value}
          </div>
          {trend && <div style={{ color, fontSize: 12, marginTop: 7 }}>{trend}</div>}
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: `${color}1f`,
            display: 'grid',
            placeItems: 'center',
            fontSize: 21,
          }}
        >
          {icon}
        </div>
      </div>

      {spark && <div style={{ marginTop: 10 }}>{spark}</div>}
    </div>
  );

  return (
    <>
      <div
        className="card section"
        style={{
          padding: 18,
          border: `1px solid ${healthColor}55`,
          background: `linear-gradient(135deg, rgba(8,23,38,.95), rgba(17,24,39,.92), ${healthColor}20)`,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr .8fr .8fr .8fr',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ color: '#94a3b8', fontSize: 12, letterSpacing: 2 }}>
              PROJECT CONTROL CENTER
            </div>
            <h1 style={{ margin: '6px 0 4px' }}>
              {p['Project Name'] || 'MASEEL MIXED-USE DEVELOPMENT'}
            </h1>
            <div className="small">
              Live Excel Dashboard | Client: {p.Client} | Consultant: {p.Consultant}
            </div>
          </div>

          <ExecCard
            title="Project Health"
            value={`${healthScore}/100`}
            icon="🩺"
            color={healthColor}
            trend={projectHealth}
          />

          <ExecCard
            title="Overall SPI"
            value={overallSpi.toFixed(2)}
            icon="⚡"
            color={overallSpi >= 1 ? '#22c55e' : overallSpi >= 0.9 ? '#facc15' : '#ef4444'}
            trend={overallSpi >= 1 ? 'Healthy schedule' : 'Schedule pressure'}
          />

          <ExecCard
            title="Finish Variance"
            value={`${o['Variance Finish Date'] || 0} Days`}
            icon="⏱️"
            color="#ef4444"
            trend="Delay impact"
          />
        </div>
      </div>

      <h2 style={{ marginTop: 20, color: '#4FC3F7' }}>
        MASEEL MASTERPLAN INTERACTIVE VIEW
      </h2>

      <div className="card section">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '210px 1fr',
            gap: 18,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              border: '1px solid #26364a',
              background: 'rgba(11,22,38,.78)',
              lineHeight: 1.8,
              fontSize: 13,
            }}
          >
            <div><span style={{ color: '#22c55e' }}>●</span> On Track (SPI ≥ 1.00)</div>
            <div><span style={{ color: '#facc15' }}>●</span> Warning (0.90 ≤ SPI &lt; 1.00)</div>
            <div><span style={{ color: '#ef4444' }}>●</span> Critical (SPI &lt; 0.90)</div>
          </div>

          <div style={{ position: 'relative', width: '100%', margin: '0 auto' }}>
            <img
              src="/maseel-masterplan.jpg.png"
              alt="Maseel Masterplan"
              style={{
                width: '100%',
                display: 'block',
                borderRadius: 18,
                border: '1px solid #26364a',
              }}
            />

            {phaseList.map((phase) => (
              <div
                key={phase.name}
                onClick={() => setSelectedPhase(getPhaseData(phase.name))}
                title={`${phase.label} - ${getPhaseStatus(phase.name)}`}
                style={{
                  position: 'absolute',
                  top: phase.top,
                  left: phase.left,
                  background: getPhaseColor(phase.name),
                  color: 'white',
                  padding: '5px 8px',
                  borderRadius: 25,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: `0 0 10px ${getPhaseColor(phase.name)}`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {phase.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedPhase && (
        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 18,
            background: 'rgba(8,23,38,.86)',
            border: '1px solid #1e3a5f',
          }}
        >
          <h3
            style={{
              color: '#4FC3F7',
              marginBottom: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{selectedPhase.Phase} Overview</span>
            <button
              onClick={() => setSelectedPhase(null)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 0,
                borderRadius: 8,
                padding: '4px 10px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            <div className="card" style={glassCard}>
              <div>
                <div className="kpi-title">Actual %</div>
                <div className="kpi-value" style={{ fontSize: 24 }}>{pct(actualValue)}</div>
              </div>
              <MiniRing value={actualValue} color="#38bdf8" />
            </div>

            <div className="card" style={glassCard}>
              <div>
                <div className="kpi-title">Planned %</div>
                <div className="kpi-value" style={{ fontSize: 24 }}>{pct(plannedValue)}</div>
              </div>
              <MiniRing value={plannedValue} color="#38bdf8" />
            </div>

            <div className="card" style={glassCard}>
              <div>
                <div className="kpi-title">Variance %</div>
                <div className="kpi-value status-bad" style={{ fontSize: 24 }}>
                  {pct(selectedPhase['Variance'])}
                </div>
              </div>
              <MiniBars />
            </div>

            <div className="card" style={glassCard}>
              <div>
                <div className="kpi-title">SPI</div>
                <div className="kpi-value" style={{ fontSize: 24 }}>
                  {spiValue.toFixed(2)}
                </div>
              </div>
              <Gauge value={spiValue} />
            </div>

            <div className="card" style={glassCard}>
              <div>
                <div className="kpi-title">Status</div>
                <div
                  className="kpi-value"
                  style={{ fontSize: 23, color: getPhaseColor(selectedPhase.Phase) }}
                >
                  {getPhaseStatus(selectedPhase.Phase)}
                </div>
              </div>
              <div style={{ fontSize: 36, color: getPhaseColor(selectedPhase.Phase) }}>
                {getPhaseStatus(selectedPhase.Phase) === 'On Track'
                  ? '✓'
                  : getPhaseStatus(selectedPhase.Phase) === 'Warning'
                  ? '!'
                  : '⚠'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div className="card" style={glassCard}>
          <h3 style={{ marginTop: 0, color: '#4FC3F7' }}>Phase Status Distribution</h3>
          <DonutChart />
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 12, fontSize: 12 }}>
            <span style={{ color: '#22c55e' }}>● {onTrack} On Track</span>
            <span style={{ color: '#facc15' }}>● {warning} Warning</span>
            <span style={{ color: '#ef4444' }}>● {critical} Critical</span>
          </div>
        </div>

        <div className="card" style={glassCard}>
          <h3 style={{ marginTop: 0, color: '#4FC3F7' }}>Most Critical Phase</h3>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#ef4444' }}>
            {mostCriticalPhase?.Phase || 'N/A'}
          </div>
          <div className="small" style={{ marginTop: 8 }}>
            SPI: {Number(mostCriticalPhase?.SPI || 0).toFixed(2)} | Variance:{' '}
            {pct(mostCriticalPhase?.Variance || 0)}
          </div>
          <div style={{ marginTop: 12, color: '#ef4444', fontSize: 13 }}>
            Immediate recovery actions are recommended.
          </div>
        </div>

        <div className="card" style={glassCard}>
          <h3 style={{ marginTop: 0, color: '#4FC3F7' }}>Project Status Commentary</h3>
          <div style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: 13 }}>
            Project health is currently <b style={{ color: healthColor }}>{projectHealth}</b>.
            Overall SPI is <b>{overallSpi.toFixed(2)}</b>, with <b style={{ color: '#ef4444' }}>{critical}</b>{' '}
            critical phase(s). The most critical area is{' '}
            <b style={{ color: '#ef4444' }}>{mostCriticalPhase?.Phase || 'N/A'}</b>. Acceleration,
            resource rebalancing, and weekly monitoring are required to protect contractual dates.
          </div>
        </div>
      </div>

      <div className="section" style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 12 }}>
        <div className="card" style={glassCard}>
          <h3 style={{ marginTop: 0, color: '#4FC3F7' }}>S-Curve Overview</h3>
          <SCurve data={data.sCurve} />
        </div>

        <div className="card" style={glassCard}>
          <h3 style={{ marginTop: 0, color: '#4FC3F7' }}>Phase Physical Status </h3>
          {phaseList.map((phase) => (
            <div
              key={phase.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 70px',
                gap: 10,
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <b>{phase.label}</b>
              <div style={{ height: 10, background: '#26364a', borderRadius: 20, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(Number(getPhaseData(phase.name)?.SPI || 0), 1) * 100}%`,
                    height: '100%',
                    background: getPhaseColor(phase.name),
                  }}
                />
              </div>
              <span style={{ color: getPhaseColor(phase.name), fontSize: 12 }}>
                {getPhaseStatus(phase.name)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="small" style={{ marginTop: 16, marginBottom: 12 }}>
        Contractor: {p.Contractor}
      </p>

      <div className="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <ExecCard title="Total Phases" value={total} icon="🏢" color="#38bdf8" trend="Project scope" />
        <ExecCard title="On Track" value={onTrack} icon="✅" color="#22c55e" trend="SPI ≥ 1.00" />
        <ExecCard title="Warning" value={warning} icon="⚠️" color="#facc15" trend="Needs monitoring" />
        <ExecCard title="Critical" value={critical} icon="🚨" color="#ef4444" trend="Immediate action" />
      </div>

      <div className="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <ExecCard title="Planned Progress" value={pct(o['Planned %'])} icon="🎯" color="#38bdf8" trend="↑ Baseline" spark={<Sparkline color="#38bdf8" />} />
        <ExecCard title="Actual Progress" value={pct(o['Actual %'])} icon="📈" color="#22c55e" trend="↑ Current" spark={<Sparkline color="#22c55e" />} />
        <ExecCard title="Variance" value={pct(o['Variance %'])} icon="📉" color="#ef4444" trend="↓ Behind plan" spark={<Sparkline color="#ef4444" />} />
        <ExecCard title="Overall SPI" value={overallSpi.toFixed(2)} icon="⚡" color="#a855f7" trend="Schedule index" spark={<Sparkline color="#a855f7" />} />
      </div>

      <div className="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <ExecCard title="BL Finish" value={o['BL Finish Date']} icon="📅" color="#38bdf8" trend="Contract baseline" />
        <ExecCard title="Forecast Finish" value={o['Forecast Finish Date']} icon="📈" color="#facc15" trend="Updated forecast" />
        <ExecCard title="Finish Variance" value={`${o['Variance Finish Date']} Days`} icon="⏱️" color="#ef4444" trend="Delay impact" />
        <ExecCard title="Remaining Time" value={`${o['Remaining Time']} Days`} icon="⌛" color="#38bdf8" trend="To completion" />
      </div>

      <div className="card section">
        <h2>Phase Progress</h2>
        {phases.map((ph: any) => (
          <div className="progress-row" key={ph.Phase}>
            <b>{ph.Phase}</b>
            <div className="bar">
              <span style={{ width: pct(ph['Actual %']) }} />
            </div>
            <span>{pct(ph['Actual %'])}</span>
          </div>
        ))}
      </div>
    </>
  );
}