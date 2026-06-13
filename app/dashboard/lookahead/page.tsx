'use client';

import { useState } from 'react';
import { useDashboardData } from '@/components/DataClient';

function formatValue(value: any) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function isCritical(value: any) {
  return String(value || '').toLowerCase() === 'yes';
}

function getStatusClass(value: any) {
  const status = String(value || '').toLowerCase();

  if (status.includes('complete')) return 'status-badge-completed';
  if (status.includes('progress')) return 'status-badge-progress';

  return 'status-badge-notstarted';
}

export default function LookaheadPage() {
  const { data, error, loading } = useDashboardData();

  const [phaseFilter, setPhaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  if (loading) return <p>Loading look ahead...</p>;
  if (error) return <p className="error">{error}</p>;

  const allRows = data.lookahead || [];

  const phases = Array.from(
    new Set(
      allRows
        .map((r: any) => String(r['02- Con.Phase'] || '').trim())
        .filter(Boolean)
    )
  ).sort();

  const phaseRows = allRows.filter((r: any) => {
    const phase = String(r['02- Con.Phase'] || '').trim();
    return phaseFilter === 'all' || phase === phaseFilter;
  });

  const statusRows = phaseRows.filter((r: any) => {
    const status = String(r['Activity Status'] || '').toLowerCase();
    const critical = String(r.Critical || '').toLowerCase();

    if (statusFilter === 'in-progress') return status.includes('progress');
    if (statusFilter === 'completed') return status.includes('complete');
    if (statusFilter === 'not-started') return status.includes('not started');
    if (statusFilter === 'critical') return critical === 'yes';

    return true;
  });

  const rows = statusRows.filter((r: any) =>
    String(r['Activity Name'] || '')
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const total = phaseRows.length;

  const inProgress = phaseRows.filter((r: any) =>
    String(r['Activity Status'] || '').toLowerCase().includes('progress')
  ).length;

  const completed = phaseRows.filter((r: any) =>
    String(r['Activity Status'] || '').toLowerCase().includes('complete')
  ).length;

  const notStarted = phaseRows.filter((r: any) =>
    String(r['Activity Status'] || '').toLowerCase().includes('not started')
  ).length;

  const critical = phaseRows.filter((r: any) => isCritical(r.Critical)).length;

  return (
    <>
      <h1>3 Week Look Ahead</h1>

      <div className="phase-filter-box section">
        <button
          className={`phase-filter-btn ${
            phaseFilter === 'all' ? 'phase-filter-active' : ''
          }`}
          onClick={() => {
            setPhaseFilter('all');
            setStatusFilter('all');
            setSearchText('');
          }}
        >
          All Phases
        </button>

        {phases.map((phase: string) => (
          <button
            key={phase}
            className={`phase-filter-btn ${
              phaseFilter === phase ? 'phase-filter-active' : ''
            }`}
            onClick={() => {
              setPhaseFilter(phase);
              setStatusFilter('all');
              setSearchText('');
            }}
          >
            {phase}
          </button>
        ))}
      </div>

      <div className="activity-summary-grid section">
        <button
          className={`activity-summary-card clickable-card ${
            statusFilter === 'all' ? 'active-filter' : ''
          }`}
          onClick={() => setStatusFilter('all')}
        >
          <span>Total Activities</span>
          <strong>{total}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${
            statusFilter === 'in-progress' ? 'active-filter' : ''
          }`}
          onClick={() => setStatusFilter('in-progress')}
        >
          <span>In Progress</span>
          <strong className="status-watch">{inProgress}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${
            statusFilter === 'completed' ? 'active-filter' : ''
          }`}
          onClick={() => setStatusFilter('completed')}
        >
          <span>Completed</span>
          <strong className="status-good">{completed}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${
            statusFilter === 'not-started' ? 'active-filter' : ''
          }`}
          onClick={() => setStatusFilter('not-started')}
        >
          <span>Not Started</span>
          <strong>{notStarted}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${
            statusFilter === 'critical' ? 'active-filter' : ''
          }`}
          onClick={() => setStatusFilter('critical')}
        >
          <span>Critical Activities</span>
          <strong className="status-bad">{critical}</strong>
        </button>
      </div>

      <div className="activity-search-box section">
        <input
          type="text"
          placeholder="Search Look Ahead Activity..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="activity-search-input"
        />
      </div>

      <p className="small section">
        Phase: <strong>{phaseFilter}</strong> | Current Filter:{' '}
        <strong>{statusFilter}</strong> | Showing {rows.length} of {phaseRows.length}{' '}
        activities
      </p>

      <div className="activities-table-box section">
        <div className="activities-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Activity ID</th>
                <th>Activity Name</th>
                <th>Duration</th>
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
              {rows.map((r: any, i: number) => (
                <tr key={i}>
                  <td>{formatValue(r['Activity ID'])}</td>
                  <td>{formatValue(r['Activity Name'])}</td>
                  <td>{formatValue(r['Original Duration'])}</td>

                  <td>
                    <span className={getStatusClass(r['Activity Status'])}>
                      {formatValue(r['Activity Status'])}
                    </span>
                  </td>

                  <td>
                    <span className="phase-pill">
                      {formatValue(r['02- Con.Phase'])}
                    </span>
                  </td>

                  <td>{formatValue(r.Start)}</td>
                  <td>{formatValue(r.Finish)}</td>
                  <td>{formatValue(r['Performance % Complete'])}</td>

                  <td
                    className={
                      Number(r['Total Float']) < 0 ? 'status-bad' : ''
                    }
                  >
                    {formatValue(r['Total Float'])}
                  </td>

                  <td>
                    <span
                      className={
                        isCritical(r.Critical)
                          ? 'critical-badge'
                          : 'normal-badge'
                      }
                    >
                      {formatValue(r.Critical)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}