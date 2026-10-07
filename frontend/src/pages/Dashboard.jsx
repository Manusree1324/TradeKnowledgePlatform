import { useEffect, useState } from 'react';
import { Bookmark, CirclePlus, FileText, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import TutorialCard from '../components/TutorialCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [tutorials, setTutorials] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tutorials', { params: { mine: true, limit: 50 } })
      .then(({ data }) => setTutorials(data.tutorials))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Your dashboard could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const visible = filter === 'all' ? tutorials : tutorials.filter((tutorial) => tutorial.status === filter);

  return (
    <main className="page-shell dashboard-page">
      <div className="dashboard-welcome"><div><p className="eyebrow">Your workspace</p><h1>Good to see you, {user?.name?.split(' ')[0]}.</h1><p>Keep your learning organized and your field knowledge moving.</p></div><Link to="/tutorials/new" className="button button-primary"><CirclePlus size={17} /> Write a guide</Link></div>
      <div className="workspace-links"><Link to="/bookmarks"><Bookmark size={17} /> Saved guides</Link><Link to="/profile"><UserRound size={17} /> Edit profile</Link><span><FileText size={17} /> {tutorials.length} guides contributed</span></div>
      <div className="feed-heading-row dashboard-section-heading"><div><p className="eyebrow">Your contributions</p><h2>My guides</h2></div><label className="filter-control"><span>Status</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">In review</option><option value="published">Published</option><option value="rejected">Needs revision</option></select></label></div>
      {error && <div className="state-message error-state" role="alert">{error}</div>}
      {loading ? <div className="feed-grid"><div className="skeleton-card" /><div className="skeleton-card" /></div> : visible.length ? <div className="feed-grid">{visible.map((tutorial) => <div className="owned-tutorial" key={tutorial._id}><TutorialCard tutorial={tutorial} /><span className={`status-tag status-${tutorial.status}`}>{tutorial.status === 'pending' ? 'In review' : tutorial.status}</span>{tutorial.moderationNote && tutorial.status === 'rejected' && <p className="moderation-note">Review note: {tutorial.moderationNote}</p>}</div>)}</div> : <div className="state-message empty-state"><strong>No guides here yet.</strong><span>{filter === 'all' ? 'Share the methods and lessons you have learned in the field.' : 'There are no guides with this status.'}</span><Link className="button button-primary" to="/tutorials/new">Create a guide</Link></div>}
    </main>
  );
}