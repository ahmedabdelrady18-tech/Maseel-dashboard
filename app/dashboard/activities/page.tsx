'use client';

import { useState } from 'react';
import { useDashboardData } from '@/components/DataClient';

function formatValue(value: any) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

export default function Activities() {
  const { data, error, loading } = useDashboardData();

  const [filter, setFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  const allRows = data.activities;

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

  const totalActivities = phaseRows.length;

  const completedActivities = phaseRows.filter(
    (r: any) => String(r['Activity Status']).toLowerCase() === 'completed'
  ).length;

  const inProgressActivities = phaseRows.filter(
    (r: any) => String(r['Activity Status']).toLowerCase() === 'in progress'
  ).length;

  const notStartedActivities = phaseRows.filter(
    (r: any) => String(r['Activity Status']).toLowerCase() === 'not started'
  ).length;

  const criticalActivities = phaseRows.filter(
    (r: any) => String(r['Critical']).toLowerCase() === 'yes'
  ).length;

  const statusRows = phaseRows.filter((r: any) => {
    const status = String(r['Activity Status']).toLowerCase();
    const critical = String(r['Critical']).toLowerCase();

    if (filter === 'completed') return status === 'completed';
    if (filter === 'in-progress') return status === 'in progress';
    if (filter === 'not-started') return status === 'not started';
    if (filter === 'critical') return critical === 'yes';

    return true;
  });

  const searchedRows = statusRows.filter((r: any) =>
    String(r['Activity Name'] || '')
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const rows = searchedRows.slice(0, 300);

  return (
    <>
      <h1>Activity Register</h1>

      <p className="small">
        Showing first 300 activities for performance. API contains full Excel source.
      </p>

      <div className="phase-filter-box section">
        <button
          className={`phase-filter-btn ${phaseFilter === 'all' ? 'phase-filter-active' : ''}`}
          onClick={() => {
            setPhaseFilter('all');
            setFilter('all');
            setSearchText('');
          }}
        >
          All Phases
        </button>

        {phases.map((phase: string) => (
          <button
            key={phase}
            className={`phase-filter-btn ${phaseFilter === phase ? 'phase-filter-active' : ''}`}
            onClick={() => {
              setPhaseFilter(phase);
              setFilter('all');
              setSearchText('');
            }}
          >
            {phase}
          </button>
        ))}
      </div>

      <div className="activity-summary-grid section">
        <button
          className={`activity-summary-card clickable-card ${filter === 'all' ? 'active-filter' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span>Total Activities</span>
          <strong>{totalActivities}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${filter === 'completed' ? 'active-filter' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <span>Completed</span>
          <strong className="status-good">{completedActivities}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${filter === 'in-progress' ? 'active-filter' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          <span>In Progress</span>
          <strong className="status-watch">{inProgressActivities}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${filter === 'not-started' ? 'active-filter' : ''}`}
          onClick={() => setFilter('not-started')}
        >
          <span>Not Started</span>
          <strong>{notStartedActivities}</strong>
        </button>

        <button
          className={`activity-summary-card clickable-card ${filter === 'critical' ? 'active-filter' : ''}`}
          onClick={() => setFilter('critical')}
        >
          <span>Critical</span>
          <strong className="status-bad">{criticalActivities}</strong>
        </button>
      </div>

      <div className="activity-search-box section">
        <input
          type="text"
          placeholder="Search Activity Name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="activity-search-input"
        />
      </div>

      <p className="small section">
        Phase: <strong>{phaseFilter}</strong> | Current Filter: <strong>{filter}</strong> | Showing{' '}
        {rows.length} of {searchedRows.length} activities
      </p>

      <div className="activities-table-box section">
        <div className="activities-table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Activity Name</th>
                <th>Phase</th>
                <th>Status</th>
                <th>BL Start</th>
                <th>BL Finish</th>
                <th>Start</th>
                <th>Finish</th>
                <th>Schedule %</th>
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

                  <td>
                    <span className="phase-pill">{formatValue(r['02- Con.Phase'])}</span>
                  </td>

                  <td>
                    <span
                      className={
                        String(r['Activity Status']).toLowerCase() === 'completed'
                          ? 'status-badge-completed'
                          : String(r['Activity Status']).toLowerCase() === 'in progress'
                          ? 'status-badge-progress'
                          : 'status-badge-notstarted'
                      }
                    >
                      {formatValue(r['Activity Status'])}
                    </span>
                  </td>

                  <td>{formatValue(r['BL Project Start'])}</td>
                  <td>{formatValue(r['BL Project Finish'])}</td>
                  <td>{formatValue(r.Start)}</td>
                  <td>{formatValue(r.Finish)}</td>
                  <td>{formatValue(r['Schedule % Complete'])}</td>
                  <td>{formatValue(r['Performance % Complete'])}</td>

                  <td className={Number(r['Total Float']) < 0 ? 'status-bad' : ''}>
                    {formatValue(r['Total Float'])}
                  </td>

                  <td>
                    <span
                      className={
                        String(r['Critical']).toLowerCase() === 'yes'
                          ? 'critical-badge'
                          : 'normal-badge'
                      }
                    >
                      {formatValue(r['Critical'])}
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