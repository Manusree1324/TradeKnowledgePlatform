import { useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(values);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not sign you in. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page page-shell">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to the knowledge feed</Link>
      <section className="auth-panel">
        <div className="auth-aside"><p className="eyebrow">Welcome back</p><h1>Pick up where the work left off.</h1><p>Your saved guides, field notes and trade community are right here.</p><span className="auth-aside-mark"><LogIn size={25} /></span></div>
        <form className="form-panel" onSubmit={submit}>
          <div><p className="eyebrow">Member access</p><h2>Sign in</h2><p className="form-intro">Use the email address connected to your account.</p></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label className="field-label">Email address<input type="email" autoComplete="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} required maxLength={254} /></label>
          <label className="field-label">Password<input type="password" autoComplete="current-password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} required /></label>
          <button className="button button-primary button-wide" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
          <p className="form-footnote">New to the trades community? <Link to="/register">Create an account</Link></p>
        </form>
      </section>
    </main>
  );
}