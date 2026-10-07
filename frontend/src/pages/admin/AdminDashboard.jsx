import { useEffect, useState } from 'react';
import { BookOpen, Eye, FolderTree, MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data.stats))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Administrator metrics could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const metrics = stats ? [
    { label: 'Community members', value: stats.users, icon: Users },
    { label: 'All tutorials', value: stats.tutorials, icon: BookOpen },
    { label: 'Pending review', value: stats.pendingTutorials, icon: FolderTree, attention: stats.pendingTutorials > 0 },
    { label: 'Published reads', value: stats.views, icon: Eye },
    { label: 'Field notes', value: stats.comments, icon: MessageSquare }
  ] : [];

  return (
    <main className="page-shell admin-page">
      <div className="dashboard-welcome"><div><p className="eyebrow">Platform oversight</p><h1>Administration</h1><p>Review community contributions and keep the knowledge library useful.</p></div></div>
      <nav className="admin-tabs"><Link className="active" to="/admin">Overview</Link><Link to="/admin/tutorials">Tutorial review{stats?.pendingTutorials > 0 && <span>{stats.pendingTutorials}</span>}</Link><Link to="/admin/users">Members</Link><Link to="/admin/categories">Trade categories</Link></nav>
      {error && <div className="state-message error-state" role="alert">{error}</div>}
      {loading ? <p className="loading-line">Loading usage statistics…</p> : <div className="metrics-grid">{metrics.map(({ label, value, icon: Icon, attention }) => <article className={`metric-tile ${attention ? 'metric-attention' : ''}`} key={label}><span className="metric-icon"><Icon size={19} /></span><span className="metric-value">{Number(value).toLocaleString()}</span><span className="metric-label">{label}</span></article>)}</div>}
      <section className="admin-actions"><div><p className="eyebrow">Work queue</p><h2>Keep the library current.</h2><p>Approve practical, clearly explained guides and remove content that needs another look.</p></div><div className="admin-action-links"><Link className="button button-primary" to="/admin/tutorials">Review tutorials</Link><Link className="button button-outline" to="/admin/users">Manage members</Link></div></section>
    </main>
  );
}