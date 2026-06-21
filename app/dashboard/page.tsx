'use client';

import { pct, useDashboardData } from '@/components/DataClient';
import { useEffect, useState, type CSSProperties } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  LabelList,
  ReferenceLine,
} from 'recharts';

const BRAND = {
  primary: '#4C5B70',
  secondary: '#4A7385',
  light: '#BAD1DF',
  cyan: '#62D6FF',
  green: '#22c55e',
  yellow: '#facc15',
  red: '#ff4d57',
  dark: '#26384B',
  panel: 'rgba(76,91,112,.92)',
  panel2: 'rgba(74,115,133,.72)',
  border: 'rgba(186,209,223,.28)',
  text: '#f8fafc',
};

const SCurve = ({ data, overallSpi }: any) => {
  const formatMonth = (value: any) => {
    const text = String(value || '');

    if (text.includes('-')) {
      const parts = text.split('-');

      if (parts.length === 3) {
        return `${parts[1]}-${parts[2]}`;
      }
    }

    return text;
  };

  const chartData = (data || []).map((x: any) => ({
    month: formatMonth(x.month),
    planned: Number(x.planned || 0) * 100,
    actual: x.actual === null ? null : Number(x.actual || 0) * 100,
    cumPlanned: Number(x.cumPlanned || 0) * 100,
    cumActual: x.cumActual === null ? null : Number(x.cumActual || 0) * 100,
  }));

  const lastActualPoint = [...chartData]
    .reverse()
    .find((x: any) => x.cumActual !== null);

  const lastPlannedPoint = chartData.find(
    (x: any) => x.month === lastActualPoint?.month
  );

  const sCurveSPI = Number(overallSpi || 0);

  const sCurveVariance =
    lastActualPoint && lastPlannedPoint
      ? lastActualPoint.cumActual - lastPlannedPoint.cumPlanned
      : 0;

  const sCurveSPIColor =
    sCurveSPI >= .95 ? BRAND.green : sCurveSPI >= 0.85 ? BRAND.yellow : BRAND.red;

  const sCurveStatus =
    sCurveSPI >= .95 ? 'ON TRACK' : sCurveSPI >= 0.85 ? 'WARNING' : 'CRITICAL';

  const currentMonth = lastActualPoint?.month || chartData[0]?.month;

  const sCurveKpiCard: CSSProperties = {
    padding: 12,
    minHeight: 72,
    background: `linear-gradient(135deg, ${BRAND.panel}, ${BRAND.panel2})`,
    border: `1px solid ${BRAND.border}`,
    boxShadow: '0 8px 22px rgba(0,0,0,.16)',
  };

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div className="card" style={sCurveKpiCard}>
          <div className="kpi-title">S-Curve SPI</div>
          <div className="kpi-value" style={{ fontSize: 24, color: sCurveSPIColor }}>
            {sCurveSPI.toFixed(2)}
          </div>
        </div>

        <div className="card" style={sCurveKpiCard}>
          <div className="kpi-title">S-Curve Status</div>
          <div className="kpi-value" style={{ fontSize: 22, color: sCurveSPIColor }}>
            {sCurveStatus}
          </div>
        </div>

        <div className="card" style={sCurveKpiCard}>
          <div className="kpi-title">S-Curve Variance</div>
          <div
            className="kpi-value"
            style={{
              fontSize: 22,
              color: sCurveVariance >= 0 ? BRAND.green : BRAND.red,
            }}
          >
            {sCurveVariance.toFixed(2)}%
          </div>
        </div>

        <div className="card" style={sCurveKpiCard}>
          <div className="kpi-title">Latest Update</div>
          <div className="kpi-value" style={{ fontSize: 22, color: BRAND.cyan }}>
            {currentMonth || 'N/A'}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={chartData} margin={{ top: 25, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(186,209,223,.18)" />
          <XAxis dataKey="month" stroke={BRAND.light} tick={{ fontSize: 11 }} />
          <YAxis stroke={BRAND.light} tickFormatter={(v) => `${v}%`} />

          <Tooltip
            contentStyle={{
              background: BRAND.dark,
              border: `1px solid ${BRAND.light}`,
              borderRadius: 10,
              color: '#fff',
            }}
            formatter={(value: any, name: any) => [`${Number(value).toFixed(2)}%`, name]}
          />

          <Legend />

          <ReferenceLine
            x={currentMonth}
            stroke={BRAND.yellow}
            strokeWidth={2}
            strokeDasharray="6 6"
            label={{
              value: `SPI ${sCurveSPI.toFixed(2)} | ${sCurveStatus}`,
              fill: sCurveSPIColor,
              position: 'top',
            }}
          />

          <Bar dataKey="planned" fill={BRAND.light} opacity={0.38} name="Monthly Planned %" />
          <Bar dataKey="actual" fill={BRAND.green} opacity={0.72} name="Monthly Actual %" />

          <Line
            type="monotone"
            dataKey="cumPlanned"
            stroke={BRAND.cyan}
            strokeWidth={4}
            dot={false}
            name="Cumulative Planned %"
          >
            <LabelList
              dataKey="cumPlanned"
              position="top"
              formatter={(v: any) => `${Number(v).toFixed(0)}%`}
              fill={BRAND.cyan}
            />
          </Line>

          <Line
            type="monotone"
            dataKey="cumActual"
            stroke={BRAND.green}
            strokeWidth={4}
            dot={{ r: 4 }}
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
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

const SPITrend = ({ data }: any) => {
  const formatMonth = (value: any) => {
    const text = String(value || '');

    if (text.includes('-')) {
      const parts = text.split('-');

      if (parts.length === 3) {
        return `${parts[1]}-${parts[2]}`;
      }
    }

    return text;
  };
    const chartData = (data || [])
    .filter((row: any) => row.spi !== null && row.spi !== undefined && row.spi !== '')
    .map((row: any) => ({
      month: formatMonth(row.month),
      spi: Number(row.spi || 0),
    }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(186,209,223,.18)" />
        <XAxis dataKey="month" stroke={BRAND.light} tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 1.3]} stroke={BRAND.light} tick={{ fontSize: 11 }} />

        <Tooltip
          formatter={(v: any) => Number(v).toFixed(2)}
          contentStyle={{
            background: BRAND.dark,
            border: `1px solid ${BRAND.light}`,
            borderRadius: 10,
            color: '#fff',
          }}
        />

        <ReferenceLine
          y={1}
          stroke={BRAND.green}
          strokeWidth={2}
          label={{ value: 'Target 1.00', fill: BRAND.green }}
        />

        <ReferenceLine y={0.9} stroke={BRAND.yellow} strokeDasharray="5 5" />

        <Area
          type="monotone"
          dataKey="spi"
          stroke={BRAND.cyan}
          fill={BRAND.cyan}
          fillOpacity={0.28}
          strokeWidth={4}
          dot={{ r: 4 }}
          name="SPI"
        >
          <LabelList
            dataKey="spi"
            position="top"
            formatter={(v: any) => Number(v).toFixed(2)}
            fill={BRAND.cyan}
          />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default function Dashboard() {
  const { data, error, loading } = useDashboardData();
  const [selectedPhase, setSelectedPhase] = useState<any>(null);
  const [statusBoxPos, setStatusBoxPos] = useState({ x: 900, y: 18 });
const [draggingStatus, setDraggingStatus] = useState(false);
const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
const [statusExpanded, setStatusExpanded] = useState(false);
useEffect(() => {
  const handleMove = (e: MouseEvent) => {
    if (!draggingStatus) return;

    setStatusBoxPos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleUp = () => {
    setDraggingStatus(false);
  };

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleUp);

  return () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleUp);
  };
}, [draggingStatus, dragOffset]);
  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  const o = data.overall || {};
  const p = data.projectInfo || {};
  const phases = data.phases || [];

  const phaseList = [
    { name: 'Phase-1', label: 'Phase 1', top: '22%', left: '58%' },
    { name: 'Phase-2', label: 'Phase 2', top: '70%', left: '35%' },
    { name: 'Phase-3', label: 'Phase 3', top: '36%', left: '63%' },
    { name: 'Phase-4', label: 'Phase 4', top: '54%', left: '47%' },
    { name: 'Phase-5', label: 'Phase 5', top: '10%', left: '74%' },
  ];

  const getPhaseData = (phaseName: string) =>
    phases.find((x: any) => x.Phase === phaseName) || null;

  const getPhaseColor = (phaseName: string) => {
    const spi = Number(getPhaseData(phaseName)?.SPI || 0);

    if (spi >= 1) return BRAND.green;
    if (spi >= 0.9) return BRAND.yellow;
    return BRAND.red;
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
  const getDaysVariance = () => {
  const bl = new Date(o['BL Finish Date']);
  const forecast = new Date(o['Forecast Finish Date']);

  if (isNaN(bl.getTime()) || isNaN(forecast.getTime())) {
    return Number(o['Variance Finish Date'] || 0);
  }

  const diff = forecast.getTime() - bl.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

const finishVarianceDays = getDaysVariance();

  const actualValue = Number(selectedPhase?.['Actual %'] || 0);
  const plannedValue = Number(selectedPhase?.['Planned %'] || 0);
  const spiValue = Number(selectedPhase?.SPI || 0);
  const varianceValue = Number(selectedPhase?.Variance || 0);

const varianceColor =
  varianceValue > 0
    ? BRAND.green
    : varianceValue < 0
    ? BRAND.red
    : BRAND.cyan;

  function phaseRiskScore(phase: any) {
    const spi = Number(phase.SPI || 0);
    const variance = Math.abs(Number(phase.Variance || 0));

    const spiRisk = spi > 0 ? (1 - spi) * 100 : 100;
    const varianceRisk = variance * 100;

    return spiRisk + varianceRisk;
  }

  const mostCriticalPhase =
    [...phases].sort((a: any, b: any) => phaseRiskScore(b) - phaseRiskScore(a))[0] ||
    null;

  const healthScore = Math.max(0, Math.min(100, Math.round(overallSpi * 100)));

  const healthColor =
    healthScore >= 95 ? BRAND.green : healthScore >= 80 ? BRAND.yellow : BRAND.red;

  const projectHealth =
    healthScore >= 95 ? 'HEALTHY' : healthScore >= 80 ? 'WATCH' : 'CRITICAL';

  const achievementRatio =
    plannedValue > 0 ? Math.min((actualValue / plannedValue) * 100, 100) : 0;

  const glassCard: CSSProperties = {
    padding: 14,
    minHeight: 92,
    background: `linear-gradient(135deg, ${BRAND.panel}, ${BRAND.panel2})`,
    border: `1px solid ${BRAND.border}`,
    boxShadow: '0 10px 28px rgba(0,0,0,.18)',
    backdropFilter: 'blur(10px)',
    transition: 'all .2s ease',
  };

  const softPanel: CSSProperties = {
    background: `linear-gradient(135deg, rgba(76,91,112,.94), rgba(74,115,133,.78))`,
    border: `1px solid ${BRAND.border}`,
    boxShadow: '0 10px 26px rgba(0,0,0,.16)',
  };

  const Sparkline = ({ color = BRAND.cyan }: any) => (
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
          background: `conic-gradient(${color} ${safeValue * 100}%, rgba(186,209,223,.22) 0)`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            width: 37,
            height: 37,
            borderRadius: '50%',
            background: BRAND.dark,
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
      safeValue >= 1 ? BRAND.green : safeValue >= 0.9 ? BRAND.yellow : BRAND.red;

    return (
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: `conic-gradient(${color} ${percent}%, rgba(186,209,223,.22) ${percent}% 100%)`,
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
            background: BRAND.dark,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>
            {safeValue.toFixed(2)}
          </div>
          <div style={{ fontSize: 8, color: BRAND.light }}>SPI</div>
        </div>
      </div>
    );
  };

  const MiniBars = ({ color }: any) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'end',
      gap: 4,
      height: 38,
    }}
  >
    {[16, 23, 14, 30, 39, 25, 48].map((h, i) => (
      <span
        key={i}
        style={{
          width: 5,
          height: h,
          borderRadius: 4,
          background: color,
          opacity: .88,
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
          background: `conic-gradient(${BRAND.green} 0 ${green}%, ${
            BRAND.yellow
          } ${green}% ${green + yellow}%, ${BRAND.red} ${green + yellow}% ${
            green + yellow + red
          }%, rgba(186,209,223,.22) 0)`,
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto',
          boxShadow: '0 14px 30px rgba(0,0,0,.18)',
        }}
      >
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: '50%',
            background: BRAND.dark,
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900 }}>{total}</div>
          <div style={{ fontSize: 11, color: BRAND.light }}>PHASES</div>
        </div>
      </div>
    );
  };

  const ExecCard = ({ title, value, icon, color, trend, spark }: any) => (
    <div
      className="card"
      style={{
        ...glassCard,
        border: `1px solid ${color}55`,
        background: `linear-gradient(135deg, rgba(76,91,112,.92) 0%, rgba(74,115,133,.72) 70%, ${color}18 100%)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 12px 30px ${color}24`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,.18)';
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
            background: `${color}26`,
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

  const RecoveryPanel = () => (
    <div
      className="card"
      style={{
        ...glassCard,
        minHeight: 'auto',
        border: `1px solid ${BRAND.yellow}55`,
        background: `linear-gradient(135deg, rgba(76,91,112,.94), rgba(74,115,133,.70), ${BRAND.yellow}12)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              color: BRAND.light,
              fontSize: 11,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
            }}
          >
            Executive Recovery Control
          </div>
          <h3 style={{ margin: '5px 0 0', color: BRAND.cyan }}>
            Recovery Dashboard
          </h3>
        </div>

        <div
          style={{
            padding: '7px 11px',
            borderRadius: 999,
            color: BRAND.yellow,
            background: `${BRAND.yellow}18`,
            border: `1px solid ${BRAND.yellow}55`,
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          ACTIVE
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}
      >
        {[
          ['Manpower Increase', 'In Progress', BRAND.yellow],
          ['Night Shift', 'Activated', BRAND.green],
          ['Resource Rebalancing', 'Required', BRAND.red],
          ['Weekly Monitoring', 'Active', BRAND.green],
        ].map(([title, status, color]) => (
          <div
            key={title}
            style={{
              padding: 12,
              borderRadius: 14,
              background: 'rgba(186,209,223,.08)',
              border: `1px solid ${color}55`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: BRAND.light,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {title}
            </div>
            <div style={{ marginTop: 6, color, fontSize: 17, fontWeight: 900 }}>
              {status}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          color: BRAND.text,
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        Contractor recovery strategy is focused on manpower increase, night shift
        implementation, productivity improvement, resource rebalancing, and weekly
        monitoring to reduce schedule variance and protect contractual milestones.
      </div>
    </div>
  );

  const PhaseProgressBars = ({ actual, planned }: any) => (
    <div style={{ display: 'grid', gap: 9, marginTop: 10 }}>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: BRAND.light,
            fontSize: 11,
            marginBottom: 5,
          }}
        >
          <span>Actual Progress</span>
          <b style={{ color: BRAND.text }}>{pct(actual)}</b>
        </div>
        <div
          style={{
            height: 9,
            borderRadius: 999,
            background: 'rgba(186,209,223,.20)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(Number(actual || 0), 1) * 100}%`,
              height: '100%',
              background: BRAND.cyan,
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: BRAND.light,
            fontSize: 11,
            marginBottom: 5,
          }}
        >
          <span>Planned Target</span>
          <b style={{ color: BRAND.text }}>{pct(planned)}</b>
        </div>
        <div
          style={{
            height: 9,
            borderRadius: 999,
            background: 'rgba(186,209,223,.20)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(Number(planned || 0), 1) * 100}%`,
              height: '100%',
              background: BRAND.light,
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </div>
  );
    return (
    <>
      <div
        className="card section"
        style={{
          padding: 18,
          border: `1px solid ${healthColor}55`,
          background: `linear-gradient(135deg, rgba(76,91,112,.95), rgba(74,115,133,.78), ${healthColor}18)`,
          boxShadow: '0 12px 32px rgba(0,0,0,.18)',
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
            <div style={{ color: BRAND.light, fontSize: 12, letterSpacing: 2 }}>
              PROJECT CONTROL CENTER
            </div>

            <h1 style={{ margin: '6px 0 4px' }}>
              {p['Project Name'] || 'MASEEL MIXED-USE DEVELOPMENT'}
            </h1>

            <div className="small">
              Contractor: {p.Contractor || 'AlEnshaiah'} | Client: {p.Client} | Consultant:{' '}
              {p.Consultant}
            </div>
          </div>

          <ExecCard
            title="Project Health"
            value={`${healthScore}/100`}
            icon={
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: `conic-gradient(${healthColor} ${healthScore}%, rgba(186,209,223,.22) 0)`,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: BRAND.dark,
                  }}
                />
              </div>
            }
            color={healthColor}
            trend={projectHealth}
          />

          <ExecCard
            title="Overall SPI"
            value={overallSpi.toFixed(2)}
            icon="⚡"
            color={overallSpi >= .95 ? BRAND.green : overallSpi >= 0.8 ? BRAND.yellow : BRAND.red}
            trend={overallSpi >= 1 ? 'Healthy schedule' : 'Schedule pressure'}
          />

          <ExecCard
            title="Finish Variance"
            value={`${finishVarianceDays} Days`}
            icon="⏱️"
            color={finishVarianceDays <= 0 ? BRAND.green : BRAND.red}
            trend="Delay impact"
          />
        </div>
      </div>

      <h2 style={{ marginTop: 20, color: BRAND.cyan }}>
        MASEEL MASTERPLAN INTERACTIVE VIEW
      </h2>

      <div className="card section" style={softPanel}>
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
              border: `1px solid ${BRAND.border}`,
              background: 'rgba(76,91,112,.46)',
              lineHeight: 1.8,
              fontSize: 13,
            }}
          >
            <div>
              <span style={{ color: BRAND.green }}>●</span> On Track (SPI ≥ 1.00)
            </div>
            <div>
              <span style={{ color: BRAND.yellow }}>●</span> Warning (0.90 ≤ SPI &lt; 1.00)
            </div>
            <div>
              <span style={{ color: BRAND.red }}>●</span> Critical (SPI &lt; 0.90)
            </div>

            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: `1px solid ${BRAND.border}`,
                color: BRAND.light,
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              Click any phase marker to open the performance and recovery control panel.
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', margin: '0 auto' }}>
            <img
              src="/maseel-masterplan.jpg.png"
              alt="Maseel Masterplan"
              style={{
                width: '100%',
                display: 'block',
                borderRadius: 18,
                border: `1px solid ${BRAND.border}`,
                boxShadow: '0 16px 34px rgba(0,0,0,.22)',
              }}
            />
                <svg
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
  style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 3,
  }}
>
  <path
    d="M35 70 C45 58, 55 48, 63 36 C68 28, 72 18, 74 10"
    fill="none"
    stroke="rgba(55, 110, 130, 0.35)"
    strokeWidth="0.48"
    strokeLinecap="round"
    strokeDasharray="1.2 5"
    style={{
      filter: 'drop-shadow(0 0 3px rgba(62, 116, 136, 0.4))',
      animation: 'executiveDashMove 12s linear infinite',
    }}
  />
</svg>
<div
  onMouseDown={(e) => {
    setDraggingStatus(true);
    setDragOffset({
      x: e.clientX - statusBoxPos.x,
      y: e.clientY - statusBoxPos.y,
    });
  }}
    onDoubleClick={() => setStatusExpanded((v) => !v)}
 
 style={{
  position: 'absolute',
  top: statusBoxPos.y,
  left: statusBoxPos.x,
  width: statusExpanded ? 340 : 180,
  padding: statusExpanded ? 20 : 12,
  borderRadius: 28,

  background:
    'linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.04) 45%, rgba(10,22,34,.82))',

  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',

  border: '1px solid rgba(255,255,255,.28)',

  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,.35),
    inset 0 -20px 45px rgba(255,255,255,.04),
    0 24px 60px rgba(0,0,0,.42),
    0 0 38px ${healthColor}55
  `,

  zIndex: 30,
  cursor: draggingStatus ? 'grabbing' : 'grab',
  userSelect: 'none',
  overflow: 'hidden',
  transition: draggingStatus ? 'none' : 'all .35s cubic-bezier(.2,.8,.2,1)',
}}
>
  <div
  style={{
    position: 'absolute',
    inset: 0,
    borderRadius: 28,
    background:
      'linear-gradient(120deg, rgba(255,255,255,.28), transparent 28%, transparent 70%, rgba(255,255,255,.10))',
    pointerEvents: 'none',
  }}
/>

<div
  style={{
    position: 'absolute',
    width: 160,
    height: 160,
    right: -55,
    top: -55,
    borderRadius: '50%',
    background: `${healthColor}33`,
    filter: 'blur(28px)',
    pointerEvents: 'none',
    animation: 'glassGlow 4s ease-in-out infinite',
  }}
/>
 <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  }}
>
  <div
    style={{
      fontSize: 6,
      letterSpacing: 2.4,
      color: BRAND.light,
      textTransform: 'uppercase',
    }}
  >
    Overall Project Status
  </div>

  <button
    onMouseDown={(e) => e.stopPropagation()}
    onClick={(e) => {
      e.stopPropagation();
      setStatusExpanded((v) => !v);
    }}
    style={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      border: '1px solid rgba(186,209,223,.3)',
      background: 'rgba(255,255,255,.08)',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: 900,
      fontSize: 14,
    }}
  >
    {statusExpanded ? '−' : '+'}
  </button>
</div>

  <div
    style={{
      fontSize: 18,
      fontWeight: 700,
      color: healthColor,
      lineHeight: 1,
    }}
  >
    {projectHealth}
  </div>

  <div
    style={{
      marginTop: 8,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
    }}
  >
    <div>
      <div style={{ fontSize: 12, color: BRAND.light }}>SPI</div>
      <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
        {overallSpi.toFixed(2)}
      </div>
    </div>

    <div>
      <div style={{ fontSize: 8, color: BRAND.light }}>Delay</div>
      <div style={{ fontSize: 16, fontWeight: 900, color: finishVarianceDays <= 0 ? BRAND.green : BRAND.red }}>
        {finishVarianceDays}
      </div>
    </div>
  </div>
{statusExpanded && (
  <div
    style={{
      marginTop: 12,
      paddingTop: 10,
      borderTop: '1px solid rgba(186,209,223,.18)',
      display: 'grid',
      gap: 8,
      animation: 'fadeUp .35s ease',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ color: BRAND.light, fontSize: 11 }}>
        Critical Focus
      </span>

      <strong style={{ color: '#ff6868' }}>
        {mostCriticalPhase?.Phase || 'N/A'}
      </strong>
    </div>

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ color: BRAND.light, fontSize: 11 }}>
        Recovery Status
      </span>

      <strong style={{ color: '#4cff88' }}>
        ACTIVE
      </strong>
    </div>

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ color: BRAND.light, fontSize: 11 }}>
        Remaining Time
      </span>

      <strong style={{ color: BRAND.cyan }}>
        {o['Remaining Time']} Days
      </strong>
    </div>
  </div>
)}
  <div
  >
  </div>
</div>
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
                  padding: '4px 8px',
                  borderRadius: 25,
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: 'pointer',
                  boxShadow: `0 0 0 4px ${getPhaseColor(phase.name)}25, 0 0 12px rgba(0,0,0,.36)`,
                  transform: 'translate(-50%, -50%)',
                  border: '1px solid rgba(255,255,255,.65)',
                  userSelect: 'none',
                }}
              >
                <span
  style={{
    position: 'relative',
    zIndex: 2,
  }}
>
  {phase.label}
</span>

<span
  style={{
    position: 'absolute',
    inset: -8,
    borderRadius: 999,
    background: getPhaseColor(phase.name),
    opacity: 0.35,
    animation: 'pulsePhase 2s infinite',
    zIndex: 1,
  }}
/>
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
            ...softPanel,
          }}
        >
          <h3
            style={{
              color: BRAND.cyan,
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
                background: BRAND.red,
                color: 'white',
                border: 0,
                borderRadius: 8,
                padding: '4px 10px',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              Close
            </button>
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr .85fr .85fr .85fr .85fr',
              gap: 10,
            }}
          >
            <div className="card" style={{ ...glassCard, minHeight: 122 }}>
              <div>
                <div className="kpi-title">Progress Achievement</div>
                <div
                  className="kpi-value"
                  style={{
                    fontSize: 26,
                    color:
                      achievementRatio >= 90
                        ? BRAND.green
                        : achievementRatio >= 75
                        ? BRAND.yellow
                        : BRAND.red,
                  }}
                >
                  {achievementRatio.toFixed(0)}%
                </div>
              </div>

              <PhaseProgressBars actual={actualValue} planned={plannedValue} />
            </div>

            <div className="card" style={{ ...glassCard, minHeight: 122 }}>
              <div>
                <div className="kpi-title">Actual %</div>
                <div className="kpi-value" style={{ fontSize: 24 }}>
                  {pct(actualValue)}
                </div>
              </div>
              <MiniRing value={actualValue} color={BRAND.cyan} />
            </div>

            <div className="card" style={{ ...glassCard, minHeight: 122 }}>
              <div>
                <div className="kpi-title">Planned %</div>
                <div className="kpi-value" style={{ fontSize: 24 }}>
                  {pct(plannedValue)}
                </div>
              </div>
              <MiniRing value={plannedValue} color={BRAND.light} />
            </div>

            <div className="card" style={{ ...glassCard, minHeight: 122 }}>
              <div>
                <div className="kpi-title">Variance %</div>
               <div
  className="kpi-value"
  style={{
    fontSize: 24,
    color: varianceColor,
  }}
>
                  {pct(selectedPhase.Variance)}
                </div>
              </div>
              <MiniBars color={varianceColor} />
            </div>

            <div className="card" style={{ ...glassCard, minHeight: 122 }}>
              <div>
                <div className="kpi-title">SPI</div>
                <div className="kpi-value" style={{ fontSize: 24 }}>
                  {spiValue.toFixed(2)}
                </div>
              </div>
              <Gauge value={spiValue} />
            </div>
          </div>

          <div
            style={{
              marginTop: 10,
              display: 'grid',
              gridTemplateColumns: '.8fr 1.2fr',
              gap: 10,
            }}
          >
            <div className="card" style={{ ...glassCard, minHeight: 'auto' }}>
              <div className="kpi-title">Status</div>
              <div
                className="kpi-value"
                style={{ fontSize: 22, color: getPhaseColor(selectedPhase.Phase) }}
              >
                {getPhaseStatus(selectedPhase.Phase)}
              </div>
              <div style={{ fontSize: 30, color: getPhaseColor(selectedPhase.Phase), marginTop: 4 }}>
                {getPhaseStatus(selectedPhase.Phase) === 'On Track'
                  ? '✓'
                  : getPhaseStatus(selectedPhase.Phase) === 'Warning'
                  ? '!'
                  : '⚠'}
              </div>
            </div>

            <RecoveryPanel />
          </div>
        </div>
      )}
            <div
        className="section"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
        }}
      >
        <div className="card" style={glassCard}>
          <h3 style={{ marginTop: 0, color: BRAND.cyan }}>Phase Status Distribution</h3>

          <DonutChart />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginTop: 12,
              fontSize: 12,
            }}
          >
            <span style={{ color: BRAND.green }}>● {onTrack} On Track</span>
            <span style={{ color: BRAND.yellow }}>● {warning} Warning</span>
            <span style={{ color: BRAND.red }}>● {critical} Critical</span>
          </div>
        </div>

        <div className="card" style={glassCard}>
          <h3 style={{ marginTop: 0, color: BRAND.cyan }}>Critical Phase</h3>

          <div style={{ fontSize: 30, fontWeight: 900, color: BRAND.red }}>
            {mostCriticalPhase?.Phase || 'N/A'}
          </div>

          <div className="small" style={{ marginTop: 8 }}>
            SPI: {Number(mostCriticalPhase?.SPI || 0).toFixed(2)} | Variance:{' '}
            {pct(mostCriticalPhase?.Variance || 0)}
          </div>

          <div className="small" style={{ marginTop: 6 }}>
            Risk Score: {phaseRiskScore(mostCriticalPhase || {}).toFixed(1)}
          </div>

          <div style={{ marginTop: 12, color: '#ffd1d1', fontSize: 13 }}>
            Recovery actions are recommended and should remain under weekly monitoring.
          </div>
        </div>

        <div className="card" style={glassCard}>
          <h3 style={{ marginTop: 0, color: BRAND.cyan }}>Executive Alerts</h3>

          <div
            style={{
              display: 'grid',
              gap: 9,
              fontSize: 13,
              color: BRAND.text,
            }}
          >
            <div
              style={{
                padding: 9,
                borderRadius: 12,
                background: 'rgba(255,77,87,.12)',
                border: `1px solid ${BRAND.red}44`,
              }}
            >
              <b style={{ color: BRAND.red }}>Critical Focus:</b>{' '}
              {mostCriticalPhase?.Phase || 'N/A'}
            </div>

            <div
              style={{
                padding: 9,
                borderRadius: 12,
                background: 'rgba(186,209,223,.08)',
                border: `1px solid ${BRAND.border}`,
              }}
            >
              <b style={{ color: BRAND.light }}>Overall SPI:</b> {overallSpi.toFixed(2)}
            </div>

            <div
              style={{
                padding: 9,
                borderRadius: 12,
                background: 'rgba(250,204,21,.12)',
                border: `1px solid ${BRAND.yellow}44`,
              }}
            >
              <b style={{ color: BRAND.yellow }}>Recovery Status:</b> Active
            </div>

            <div
              style={{
                padding: 9,
                borderRadius: 12,
                background: 'rgba(186,209,223,.08)',
                border: `1px solid ${BRAND.border}`,
              }}
            >
              Project health is currently{' '}
              <b style={{ color: healthColor }}>{projectHealth}</b>. Acceleration,
              resource rebalancing, manpower enhancement, and weekly monitoring are required.
            </div>
          </div>
        </div>
      </div>

      <div
        className="section"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr .75fr',
          gap: 12,
        }}
      >
        <div className="card" style={glassCard}>
          <h3 style={{ marginTop: 0, color: BRAND.cyan }}>S-Curve Overview</h3>
          <SCurve data={data.sCurve} overallSpi={overallSpi} />
        </div>

        <div className="card" style={glassCard}>
          <h3 style={{ marginTop: 0, color: BRAND.cyan }}>Phase Physical Status</h3>

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

              <div
                style={{
                  height: 10,
                  background: 'rgba(186,209,223,.20)',
                  borderRadius: 20,
                  overflow: 'hidden',
                }}
              >
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

          <div
            style={{
              marginTop: 20,
              borderTop: `1px solid ${BRAND.border}`,
              paddingTop: 15,
            }}
          >
            <h3 style={{ marginTop: 0, color: BRAND.cyan }}>SPI Trend</h3>
            <SPITrend data={data.spiTrend} />
          </div>
        </div>
      </div>

      <p className="small" style={{ marginTop: 16, marginBottom: 12 }}>
        Contractor: {p.Contractor || 'AlEnshaiah'}
      </p>

      <div
        className="section"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        <ExecCard
          title="Total Phases"
          value={total}
          icon="🏢"
          color={BRAND.cyan}
          trend="Project scope"
        />

        <ExecCard
          title="On Track"
          value={onTrack}
          icon="✅"
          color={BRAND.green}
          trend="SPI ≥ 1.00"
        />

        <ExecCard
          title="Warning"
          value={warning}
          icon="⚠️"
          color={BRAND.yellow}
          trend="Needs monitoring"
        />

        <ExecCard
          title="Critical"
          value={critical}
          icon="🚨"
          color={BRAND.red}
          trend="Immediate action"
        />
      </div>

      <div
        className="section"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        <ExecCard
          title="Planned Progress"
          value={pct(o['Planned %'])}
          icon="🎯"
          color={BRAND.light}
          trend="↑ Baseline"
          spark={<Sparkline color={BRAND.light} />}
        />

        <ExecCard
          title="Actual Progress"
          value={pct(o['Actual %'])}
          icon="📈"
          color={BRAND.cyan}
          trend="↑ Current"
          spark={<Sparkline color={BRAND.cyan} />}
        />

        <ExecCard
          title="Variance"
          value={pct(o['Variance %'])}
          icon="📉"
          color={BRAND.red}
          trend="↓ Behind plan"
          spark={<Sparkline color={BRAND.red} />}
        />

        <ExecCard
          title="Overall SPI"
          value={overallSpi.toFixed(2)}
          icon="⚡"
          color={healthColor}
          trend="Schedule index"
          spark={<Sparkline color={healthColor} />}
        />
      </div>
            <div
        className="section"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        <ExecCard
          title="BL Finish"
          value={o['BL Finish Date']}
          icon="📅"
          color={BRAND.light}
          trend="Contract baseline"
        />

        <ExecCard
          title="Forecast Finish"
          value={o['Forecast Finish Date']}
          icon="📈"
          color={BRAND.yellow}
          trend="Updated forecast"
        />

        <ExecCard
  title="Finish Variance"
  value={`${finishVarianceDays} Days`}
  icon="⏱️"
  color={finishVarianceDays <= 0 ? BRAND.green : BRAND.red}
  trend={finishVarianceDays <= 0 ? "On Schedule" : "Delay impact"}
/>

        <ExecCard
          title="Remaining Time"
          value={`${o['Remaining Time']} Days`}
          icon="⌛"
          color={BRAND.cyan}
          trend="To completion"
        />
      </div>

      <div className="card section" style={glassCard}>
        <h2 style={{ marginTop: 0, color: BRAND.cyan }}>Phase Progress</h2>

        {phases.map((ph: any) => {
          const actual = Number(ph['Actual %'] || 0);
          const planned = Number(ph['Planned %'] || 0);

          const ratio =
            planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;

          const color =
            ratio >= 95 ? BRAND.green : ratio >= 80 ? BRAND.yellow : BRAND.red;

          return (
            <div
              key={ph.Phase}
              style={{
                marginTop: 8,
                paddingBottom: 8,
                borderBottom: `1px solid ${BRAND.border}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <strong style={{ fontSize: 14, color: '#fff' }}>{ph.Phase}</strong>

                <div style={{ fontSize: 12, color: BRAND.light }}>
                  Actual {pct(actual)} | Planned {pct(planned)}
                </div>
              </div>

              <div
                style={{
                  height: 12,
                  background: 'rgba(186,209,223,.20)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${ratio}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 999,
                    transition: 'all .5s ease',
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  color,
                  fontWeight: 500,
                }}
              >
                SPI: {Number(ph.SPI || 0).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}