import { useEffect, useState } from 'react';
import { Search, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadUsers(term = query) {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/users', { params: { search: term } });
      setUsers(data.users);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Members could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(''); }, []);

  async function changeRole(user, role) {
    try {
      await api.patch(`/admin/users/${user._id}`, { role });
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Member role could not be updated.');
    }
  }

  async function removeUser(user) {
    if (!window.confirm(`Remove ${user.name} and their tutorials? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers((current) => current.filter((item) => item._id !== user._id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Member could not be removed.');
    }
  }

  return (
    <main className="page-shell admin-page">
      <div className="dashboard-welcome"><div><p className="eyebrow">Administration / Members</p><h1>Community members</h1><p>Review account roles and remove accounts that violate community standards.</p></div></div>
      <nav className="admin-tabs"><Link to="/admin">Overview</Link><Link to="/admin/tutorials">Tutorial review</Link><Link className="active" to="/admin/users">Members</Link><Link to="/admin/categories">Trade categories</Link></nav>
      <div className="admin-toolbar"><div><p className="eyebrow">Member directory</p><h2><Users size={20} /> Accounts</h2></div><form className="admin-search" onSubmit={(event) => { event.preventDefault(); setQuery(search); loadUsers(search); }}><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find by name or email" aria-label="Search members" /><button className="button button-small button-dark">Search</button></form></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p className="loading-line">Loading members…</p> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Member</th><th>Trade</th><th>Joined</th><th>Access</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{users.map((member) => <tr key={member._id}><td><Link className="member-cell" to={`/profile/${member._id}`}><span className="avatar-small">{member.name?.slice(0, 1).toUpperCase()}</span><span><strong>{member.name}</strong><small>{member.email}</small></span></Link></td><td>{member.tradeSpecialization || '—'}</td><td>{new Date(member.createdAt).toLocaleDateString()}</td><td><select aria-label={`Role for ${member.name}`} value={member.role} onChange={(event) => changeRole(member, event.target.value)}><option value="student">Student</option><option value="professional">Professional</option><option value="admin">Admin</option></select></td><td><button className="icon-button danger-icon" onClick={() => removeUser(member)} aria-label={`Remove ${member.name}`}><Trash2 size={16} /></button></td></tr>)}</tbody></table>{users.length === 0 && <p className="empty-inline">No members match this search.</p>}</div>}
    </main>
  );
}