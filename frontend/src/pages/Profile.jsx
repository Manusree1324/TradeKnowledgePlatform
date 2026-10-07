import { useEffect, useState } from 'react';
import { ArrowLeft, Camera, Save, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, assetUrl } from '../services/api';

export default function Profile() {
  const { userId } = useParams();
  const { user, refreshUser } = useAuth();
  const isOwnProfile = !userId || userId === user?._id;
  const [profile, setProfile] = useState(null);
  const [values, setValues] = useState({ name: '', tradeSpecialization: '', experienceLevel: 'beginner', bio: '', profileImage: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setLoading(true);
    const request = isOwnProfile ? api.get('/profile/me') : api.get(`/profile/${userId}`);
    request.then(({ data }) => {
      setProfile(data.user);
      setValues({ name: data.user.name || '', tradeSpecialization: data.user.tradeSpecialization || '', experienceLevel: data.user.experienceLevel || 'beginner', bio: data.user.bio || '', profileImage: data.user.profileImage || '' });
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Profile could not be loaded.'))
      .finally(() => setLoading(false));
  }, [userId, isOwnProfile]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const { data } = await api.put('/profile/me', values);
      setProfile(data.user);
      await refreshUser();
      setNotice('Profile updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Profile changes could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="page-shell"><p className="loading-line">Loading profile…</p></main>;
  if (error && !profile) return <main className="page-shell"><div className="state-message error-state" role="alert">{error}<Link to="/" className="text-link">Return to the feed</Link></div></main>;

  return (
    <main className="page-shell profile-page">
      <Link to={isOwnProfile ? '/dashboard' : '/'} className="back-link"><ArrowLeft size={16} /> {isOwnProfile ? 'Your dashboard' : 'Knowledge feed'}</Link>
      <div className="profile-heading"><div className="profile-avatar">{profile.profileImage ? <img src={assetUrl(profile.profileImage)} alt="" /> : <UserRound size={32} />}</div><div><p className="eyebrow">{isOwnProfile ? 'Your trade profile' : 'Community member'}</p><h1>{profile.name}</h1><p>{profile.tradeSpecialization || 'Trade learner'} · {profile.experienceLevel}</p></div></div>
      {isOwnProfile ? <form className="profile-form" onSubmit={submit}>
        <div className="form-section-heading"><Camera size={18} /><div><h2>About you</h2><p>Help other members understand your experience and interests.</p></div></div>
        {error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-success" role="status">{notice}</p>}
        <label className="field-label">Name<input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} required minLength={2} maxLength={100} /></label>
        <div className="form-row"><label className="field-label">Trade specialization<input value={values.tradeSpecialization} onChange={(event) => setValues({ ...values, tradeSpecialization: event.target.value })} maxLength={80} /></label><label className="field-label">Experience level<select value={values.experienceLevel} onChange={(event) => setValues({ ...values, experienceLevel: event.target.value })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label></div>
        <label className="field-label">Profile image URL <span className="field-hint">Optional</span><input type="url" value={values.profileImage} onChange={(event) => setValues({ ...values, profileImage: event.target.value })} placeholder="https://…" /></label>
        <label className="field-label">Short bio<textarea value={values.bio} onChange={(event) => setValues({ ...values, bio: event.target.value })} maxLength={500} rows={5} placeholder="What do you work on, or what are you learning?" /></label>
        <button className="button button-primary" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save profile'}</button>
      </form> : <section className="public-bio"><p className="eyebrow">About</p><p>{profile.bio || 'This member has not added a bio yet.'}</p><p className="profile-joined">Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p></section>}
    </main>
  );
}