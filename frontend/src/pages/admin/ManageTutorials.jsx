import { useEffect, useState } from 'react';
import { Check, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function ManageTutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTutorials(filter = status) {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/tutorials', { params: filter === 'all' ? {} : { status: filter } });
      setTutorials(data.tutorials);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Tutorials could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTutorials('pending'); }, []);

  async function moderate(tutorial, nextStatus) {
    setError('');
    try {
      await api.patch(`/admin/tutorials/${tutorial._id}/status`, { status: nextStatus, moderationNote: notes[tutorial._id] || '' });
      setTutorials((current) => current.filter((item) => item._id !== tutorial._id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Moderation decision could not be saved.');
    }
  }

  return (
    <main className="page-shell admin-page">
      <div className="dashboard-welcome"><div><p className="eyebrow">Administration / Content</p><h1>Tutorial review</h1><p>Check clarity, practical value and safety notes before approving a guide.</p></div></div>
      <nav className="admin-tabs"><Link to="/admin">Overview</Link><Link className="active" to="/admin/tutorials">Tutorial review</Link><Link to="/admin/users">Members</Link><Link to="/admin/categories">Trade categories</Link></nav>
      <div className="admin-toolbar"><div><p className="eyebrow">Content queue</p><h2>Submitted guides</h2></div><label className="filter-control"><span>Status</span><select value={status} onChange={(event) => { setStatus(event.target.value); loadTutorials(event.target.value); }}><option value="pending">Pending review</option><option value="published">Published</option><option value="rejected">Rejected</option><option value="all">All statuses</option></select></label></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p className="loading-line">Loading submitted guides…</p> : tutorials.length ? <div className="moderation-list">{tutorials.map((tutorial) => <article className="moderation-item" key={tutorial._id}><div className="moderation-topline"><span className="category-label">{tutorial.category?.name}</span><span className={`status-tag status-${tutorial.status}`}>{tutorial.status}</span></div><h3>{tutorial.title}</h3><p>{tutorial.description}</p><p className="moderation-author">Submitted by {tutorial.author?.name} · {new Date(tutorial.createdAt).toLocaleDateString()}</p><div className="moderation-checks"><span>{tutorial.steps?.length || 0} practical steps</span><span>{tutorial.safetyPrecautions?.length || 0} safety precautions</span></div><div className="moderation-actions"><Link className="button button-small button-outline" to={`/tutorials/${tutorial._id}`} target="_blank"><ExternalLink size={14} /> Read full guide</Link>{tutorial.status !== 'published' && <button className="button button-small button-primary" onClick={() => moderate(tutorial, 'published')}><Check size={15} /> Approve</button>}{tutorial.status !== 'rejected' && <button className="button button-small button-danger" onClick={() => moderate(tutorial, 'rejected')}><X size={15} /> Reject</button>}</div>{tutorial.status === 'pending' && <label className="field-label moderation-note-field">Review note <span className="field-hint">Optional; included with a rejection</span><textarea value={notes[tutorial._id] || ''} maxLength={1000} rows={2} onChange={(event) => setNotes({ ...notes, [tutorial._id]: event.target.value })} placeholder="Explain what needs revision." /></label>}</article>)}</div> : <div className="state-message empty-state"><strong>No guides in this queue.</strong><span>Nothing needs attention in the selected status.</span></div>}
    </main>
  );
}