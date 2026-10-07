import React from 'react';
import { Wrench, ShieldCheck } from 'lucide-react';

export default function Header({ isHealthy }) {
  return (
    <header className="header-navbar">
      <div className="navbar-inner">
        <a href="#" className="brand-logo">
          <div className="brand-icon-wrapper">
            <Wrench size={22} />
          </div>
          <span>Trade<span className="brand-accent">Knowledge</span> Hub</span>
        </a>

        <div className="nav-links">
          <a href="#categories" className="nav-link">Trades</a>
          <a href="#documentation" className="nav-link">Docs</a>
          <a href="#standards" className="nav-link">Standards</a>
          <a href="#status" className="nav-link">System Status</a>
        </div>

        <div className="status-badge-header">
          <div className="pulse-dot" style={{ backgroundColor: isHealthy ? '#10b981' : '#f59e0b' }}></div>
          <span>{isHealthy ? 'Backend API Active' : 'Connecting to API...'}</span>
        </div>
      </div>
    </header>
  );
}
