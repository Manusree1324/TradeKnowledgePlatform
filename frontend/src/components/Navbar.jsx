import { useState } from 'react';
import { BookOpen, Menu, Plus, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark"><BookOpen size={19} /></span>
          <span>Trade<span className="brand-highlight">Knowledge</span></span>
        </Link>
        <button className="icon-button mobile-menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end onClick={closeMenu}>Knowledge feed</NavLink>
          <NavLink to="/categories" onClick={closeMenu}>Trades</NavLink>
          {user && <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" onClick={closeMenu}>Administration</NavLink>}
          {!user && <div className="mobile-auth-links"><NavLink to="/login" onClick={closeMenu}>Sign in</NavLink><NavLink to="/register" onClick={closeMenu}>Join the community</NavLink></div>}
          {user && <button className="mobile-signout" onClick={() => { logout(); closeMenu(); }}>Sign out</button>}
        </nav>
        <div className="nav-actions">
          {user ? <>
            <Link className="button button-small button-primary" to="/tutorials/new"><Plus size={16} /> Share a guide</Link>
            <Link className="user-chip" to="/profile" aria-label={`View ${user.name}'s profile`}>
              <span className="avatar-small">{user.name?.slice(0, 1).toUpperCase()}</span><span>{user.name?.split(' ')[0]}</span>
            </Link>
            <button className="button button-small button-quiet" onClick={logout}>Sign out</button>
          </> : <>
            <Link className="nav-login" to="/login">Sign in</Link>
            <Link className="button button-small button-primary" to="/register">Join the community</Link>
          </>}
        </div>
      </div>
    </header>
  );
}