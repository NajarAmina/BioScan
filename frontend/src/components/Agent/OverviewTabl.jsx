import React, { useEffect, useState } from 'react';
import { ShoppingBag, Activity, AlertTriangle, Star } from 'lucide-react';
import { apiFetch, AuthExpiredError } from '../../utils/apiFetch';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const OverviewTab = () => {
  const [kpis, setKpis] = useState([]);
  const [nutritionData, setNutritionData] = useState([]);
  const [additiveData, setAdditiveData] = useState([]);
  const [activityRows, setActivityRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch('http://localhost:5000/api/dashboard/agent');
        const data = await res.json();
        if (cancelled) return;

        const realKpis = [
          {
            id: 'products',
            title: 'Total Produits',
            value: data?.kpis?.totalProducts ?? 0,
            subtitle: 'Catalogué',
            icon: <ShoppingBag size={22} color="#2563eb" />,
          },
          {
            id: 'scans',
            title: 'Scans du jour',
            value: data?.kpis?.scansToday ?? 0,
            subtitle: 'Nouvel examen',
            icon: <Activity size={22} color="#059669" />,
          },
          {
            id: 'alerts',
            title: 'Alertes de données',
            value: data?.kpis?.alerts ?? 0,
            subtitle: 'À vérifier',
            icon: <AlertTriangle size={22} color="#dc2626" />,
          },
          {
            id: 'score',
            title: 'Score moyen du catalogue',
            value: `${data?.kpis?.avgScore ?? 0}%`,
            subtitle: 'Qualité globale',
            icon: <Star size={22} color="#f59e0b" />,
          },
        ];

        setKpis(realKpis);
        setNutritionData(Array.isArray(data?.nutritionData) ? data.nutritionData : []);
        setAdditiveData(Array.isArray(data?.additiveData) ? data.additiveData : []);
        setActivityRows(Array.isArray(data?.activityRows) ? data.activityRows : []);
      } catch (err) {
        if (err instanceof AuthExpiredError) return;
        if (cancelled) return;
        setError(err.message || 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const getStatusBadgeStyle = (status) => ({
    ...styles.statusBadge,
    backgroundColor: status === 'Validé' ? '#dcfce7' : '#fef3c7',
    color: status === 'Validé' ? '#166534' : '#92400e',
  });

  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.errorBox}>
          ⚠️ {error}
          <button type="button" onClick={() => setError('')} style={styles.errorClose}>✕</button>
        </div>
      )}
      <section style={styles.kpiSection}>
        {loading && kpis.length === 0 ? (
          <div style={styles.infoBox}>⏳ Chargement…</div>
        ) : kpis.map((kpi) => (
          <div key={kpi.id} style={styles.kpiCard}>
            <div style={styles.kpiIcon}>{kpi.icon}</div>
            <div>
              <p style={styles.kpiTitle}>{kpi.title}</p>
              <h2 style={styles.kpiValue}>{kpi.value}</h2>
              <span style={styles.kpiSubtitle}>{kpi.subtitle}</span>
            </div>
          </div>
        ))}
      </section>

      <section style={styles.chartSection}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Répartition nutritionnelle</h3>
              <p style={styles.chartSubtitle}>Excellent / Bon / Moyen / Mauvais</p>
            </div>
          </div>
          <div style={styles.donutWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={nutritionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={4}
                  stroke="transparent"
                >
                  {nutritionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.legendGrid}>
              {nutritionData.map((item) => (
                <div key={item.name} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: item.color }} />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Additifs les plus fréquents</h3>
              <p style={styles.chartSubtitle}>Top 5 des additifs observés</p>
            </div>
          </div>
          <div style={styles.barWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={additiveData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2563eb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section style={styles.tableSection}>
        <div style={styles.tableHeader}>
          <div>
            <h3 style={styles.tableTitle}>Dernières analyses effectuées</h3>
            <p style={styles.tableSubtitle}>Historique récent des évaluations IA</p>
          </div>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Produit</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Score IA</th>
                <th style={styles.th}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {activityRows.map((row) => (
                <tr key={`${row.product}-${row.date}`} style={styles.tr}>
                  <td style={styles.td}>{row.product}</td>
                  <td style={styles.td}>{row.date}</td>
                  <td style={styles.td}>{row.score}%</td>
                  <td style={styles.td}>
                    <span style={getStatusBadgeStyle(row.status)}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  infoBox: {
    padding: '1rem',
    borderRadius: '0.75rem',
    backgroundColor: '#fff',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
    color: '#64748b',
    textAlign: 'center',
    gridColumn: '1 / -1',
  },
  errorBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '0.75rem',
    color: '#991b1b',
    fontSize: '0.875rem',
  },
  errorClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#991b1b',
    fontWeight: 700,
    fontSize: '1rem',
  },
  kpiSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  kpiCard: {
    display: 'grid',
    gridTemplateColumns: '72px 1fr',
    gap: '1rem',
    padding: '1.25rem',
    borderRadius: '1rem',
    backgroundColor: '#fff',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
    minHeight: 120,
    alignItems: 'center',
  },
  kpiIcon: {
    width: 56,
    height: 56,
    borderRadius: '18px',
    backgroundColor: '#eff6ff',
    display: 'grid',
    placeItems: 'center',
  },
  kpiTitle: {
    margin: 0,
    fontSize: 14,
    color: '#475569',
  },
  kpiValue: {
    margin: '0.35rem 0 0 0',
    fontSize: 28,
    fontWeight: 700,
    color: '#0f172a',
  },
  kpiSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  chartSection: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.5rem',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
  },
  chartHeader: {
    marginBottom: '1rem',
  },
  chartTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  chartSubtitle: {
    margin: '0.35rem 0 0 0',
    fontSize: 13,
    color: '#64748b',
  },
  donutWrapper: {
    display: 'grid',
    gap: '1rem',
  },
  legendGrid: {
    display: 'grid',
    gap: '0.65rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#334155',
    fontSize: 14,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    display: 'inline-block',
  },
  barWrapper: {
    width: '100%',
    height: 280,
  },
  tableSection: {
    borderRadius: '1rem',
    backgroundColor: '#fff',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
    padding: '1.5rem',
  },
  tableHeader: {
    marginBottom: '1rem',
  },
  tableTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  tableSubtitle: {
    margin: '0.35rem 0 0 0',
    fontSize: 13,
    color: '#64748b',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 640,
  },
  th: {
    textAlign: 'left',
    padding: '1rem 1rem 0.75rem',
    fontSize: 13,
    fontWeight: 700,
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '0.9rem 1rem',
    fontSize: 14,
    color: '#334155',
    verticalAlign: 'middle',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem 0.85rem',
    borderRadius: '999px',
    fontSize: 12,
    fontWeight: 700,
  },
};

export default OverviewTab;