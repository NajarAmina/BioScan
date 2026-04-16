import React from 'react';

/**
 * Props :
 *  - statsByRole : { total, consommateur, fournisseur, agent, administrateur }
 */
const OverviewTab = ({ statsByRole = {} }) => {
  const stats = [
    { title: 'Total Utilisateurs', value: statsByRole.total || 0, change: '+12%', color: '#f59e0b', icon: '👥' },
    { title: 'Consommateurs', value: statsByRole.consommateur || 0, change: '+18%', color: '#10b981', icon: '🛒' },
    { title: 'Fournisseurs', value: statsByRole.fournisseur || 0, change: '+5%', color: '#3b82f6', icon: '🏭' },
    { title: 'Agents', value: statsByRole.agent || 0, change: '+3%', color: '#8b5cf6', icon: '👮' },
  ];

  const trafficData = [
    { label: 'Consommateurs', value: statsByRole.consommateur || 0, color: '#10b981' },
    { label: 'Fournisseurs', value: statsByRole.fournisseur || 0, color: '#3b82f6' },
    { label: 'Agents', value: statsByRole.agent || 0, color: '#8b5cf6' },
  ];

  const total = statsByRole.total || 1; // évite division par zéro

  return (
    <>
      {/* ── Stat Cards ── */}
      <div style={S.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={S.statCard}>
            <div style={S.statHeader}>
              <div>
                <p style={S.statTitle}>{stat.title}</p>
                <h3 style={S.statValue}>{stat.value}</h3>
              </div>
              <div style={{ ...S.statIconBox, backgroundColor: `${stat.color}20` }}>
                <span style={{ fontSize: 24 }}>{stat.icon}</span>
              </div>
            </div>
            <div style={{ ...S.statFooter, backgroundColor: stat.color }}>
              <span style={S.statChange}>{stat.change} ↗</span>
              <span style={S.statLabel}>depuis le mois dernier</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div style={S.chartsGrid}>
        {/* Courbe activité */}
        <div style={S.chartCard}>
          <div style={S.cardHeader}>
            <h3 style={S.cardTitle}>Activité des Utilisateurs</h3>
            <select style={S.select}>
              <option>Cette semaine</option>
              <option>Ce mois</option>
            </select>
          </div>
          <svg viewBox="0 0 500 150" style={{ width: '100%', height: 150 }}>
            <defs>
              <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,100 C100,50 200,120 300,80 C400,40 500,90 500,20"
              fill="none" stroke="#3b82f6" strokeWidth="3" />
            <path d="M0,100 C100,50 200,120 300,80 C400,40 500,90 500,20 V150 H0 Z"
              fill="url(#grad)" opacity="0.2" />
          </svg>
        </div>

        {/* Donut répartition */}
        <div style={S.chartCard}>
          <div style={S.cardHeader}>
            <h3 style={S.cardTitle}>Répartition des Rôles</h3>
          </div>
          <div style={S.donutContainer}>
            <div style={S.donutChart}>
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#eee" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#10b981" strokeWidth="3"
                  strokeDasharray={`${(statsByRole.consommateur / total) * 100}, 100`} />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#3b82f6" strokeWidth="3"
                  strokeDasharray={`${(statsByRole.fournisseur / total) * 100}, 100`}
                  strokeDashoffset={`-${(statsByRole.consommateur / total) * 100}`} />
              </svg>
              <div style={S.donutCenter}>
                <span style={S.donutValue}>{statsByRole.total || 0}</span>
                <span style={S.donutLabel}>Total</span>
              </div>
            </div>
            <div style={S.legend}>
              {trafficData.map((item, i) => (
                <div key={i} style={S.legendItem}>
                  <span style={{ ...S.dot, backgroundColor: item.color }} />
                  {item.label} ({item.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Barres état système */}
        <div style={S.chartCard}>
          <div style={S.cardHeader}>
            <h3 style={S.cardTitle}>État du Système</h3>
          </div>
          <div style={S.trafficList}>
            {trafficData.map((item, i) => (
              <div key={i} style={S.trafficItem}>
                <div style={S.trafficHeader}>
                  <span style={S.trafficLabel}>{item.label}</span>
                  <span style={S.trafficValue}>{item.value}</span>
                </div>
                <div style={S.progressBg}>
                  <div style={{
                    ...S.progressFill,
                    width: `${(item.value / total) * 100}%`,
                    backgroundColor: item.color,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const S = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 140 },
  statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  statTitle: { color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.5rem 0', fontWeight: 500 },
  statValue: { fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  statIconBox: { width: 48, height: 48, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statFooter: { padding: '0.75rem', borderRadius: '0.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' },
  statChange: { fontWeight: 700, fontSize: '0.875rem' },
  statLabel: { fontSize: '0.75rem', opacity: 0.9 },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  chartCard: { backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  select: { padding: '0.3rem 0.6rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 13 },
  donutContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  donutChart: { position: 'relative', width: 130, height: 130 },
  donutCenter: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },
  donutValue: { display: 'block', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' },
  donutLabel: { fontSize: '0.75rem', color: '#64748b' },
  legend: { marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' },
  dot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  trafficList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  trafficItem: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  trafficHeader: { display: 'flex', justifyContent: 'space-between' },
  trafficLabel: { fontSize: '0.875rem', color: '#475569', fontWeight: 500 },
  trafficValue: { fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' },
  progressBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s ease' },
};

export default OverviewTab;