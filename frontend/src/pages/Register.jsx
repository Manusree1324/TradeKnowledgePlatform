import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', role: 'student', tradeSpecialization: '', experienceLevel: 'beginner' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(values);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Your account could not be created. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="auth-page page-shell">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to the knowledge feed</Link>
      <section className="auth-panel register-panel">
        <div className="auth-aside"><p className="eyebrow">Built by the trades</p><h1>Make your know-how count.</h1><p>Learn from experienced people, keep useful methods close, and pass practical knowledge along.</p><div className="aside-stat"><strong>Learn</strong><span>Save guides worth keeping</span></div><div className="aside-stat"><strong>Share</strong><span>Help the next person on the job</span></div></div>
        <form className="form-panel" onSubmit={submit}>
          <div><p className="eyebrow">Get started</p><h2>Create your account</h2><p className="form-intro">A few details help tailor your trade community.</p></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label className="field-label">Your name<input value={values.name} onChange={(event) => update('name', event.target.value)} required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label className="field-label">Email address<input type="email" value={values.email} onChange={(event) => update('email', event.target.value)} required maxLength={254} autoComplete="email" /></label>
          <label className="field-label">Password <span className="field-hint">At least 10 characters</span><input type="password" value={values.password} onChange={(event) => update('password', event.target.value)} required minLength={10} maxLength={128} autoComplete="new-password" /></label>
          <div className="form-row">
            <label className="field-label">I am a<select value={values.role} onChange={(event) => update('role', event.target.value)}><option value="student">Student / apprentice</option><option value="professional">Trade professional</option></select></label>
            <label className="field-label">Experience<select value={values.experienceLevel} onChange={(event) => update('experienceLevel', event.target.value)}><option value="beginner">Getting started</option><option value="intermediate">Building experience</option><option value="advanced">Experienced</option></select></label>
          </div>
          <label className="field-label">Trade specialization <span className="field-hint">Optional</span><input value={values.tradeSpecialization} onChange={(event) => update('tradeSpecialization', event.target.value)} maxLength={80} placeholder="For example, electrical" /></label>
          <button className="button button-primary button-wide" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
          <p className="form-footnote">Already a member? <Link to="/login">Sign in</Link></p>
        </form>
      </section>
    </main>
  );
}