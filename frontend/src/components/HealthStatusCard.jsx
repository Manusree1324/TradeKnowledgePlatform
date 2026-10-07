import React, { useState, useEffect } from 'react';
import { Server, Database, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function HealthStatusCard({ onHealthUpdate }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
      if (onHealthUpdate) onHealthUpdate(true);
    } catch (err) {
      setError(err.message || 'Failed to reach API server');
      if (onHealthUpdate) onHealthUpdate(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="status">
      <div className="section-header">
        <h2 className="section-title">Backend API Health Diagnostics</h2>
        <p className="section-subtitle">Real-time status monitor connecting React frontend to Express `/api/health` endpoint.</p>
      </div>

      <div className="status-section">
        <div className="status-card">
          <div className="status-card-header">
            <div className="status-card-title">
              <Server size={20} color="#06b6d4" /> Express Server Status
            </div>
            <button 
              onClick={fetchHealth} 
              className="btn-secondary" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> {loading ? 'Checking...' : 'Refresh'}
            </button>
          </div>

          <div className="status-list">
            <div className="status-item">
              <span className="status-label">API Endpoint</span>
              <span className="status-value">GET /api/health</span>
            </div>

            <div className="status-item">
              <span className="status-label">Response Status</span>
              <span className="status-value" style={{ color: error ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {error ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                {error ? 'Offline / Error' : '200 OK'}
              </span>
            </div>

            <div className="status-item">
              <span className="status-label">Uptime</span>
              <span className="status-value">{healthData?.uptime || 'N/A'}</span>
            </div>

            <div className="status-item">
              <span className="status-label">Environment</span>
              <span className="status-value">{healthData?.environment || 'development'}</span>
            </div>

            <div className="status-item">
              <span className="status-label">Last Polled</span>
              <span className="status-value" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} /> {lastChecked || 'Just now'}
              </span>
            </div>
          </div>
        </div>

        <div className="status-card">
          <div className="status-card-header">
            <div className="status-card-title">
              <Database size={20} color="#f59e0b" /> Database Diagnostics
            </div>
          </div>

          <div className="status-list">
            <div className="status-item">
              <span className="status-label">Database Provider</span>
              <span className="status-value">MongoDB Atlas (Mongoose)</span>
            </div>

            <div className="status-item">
              <span className="status-label">Connection State</span>
              <span className="status-value" style={{ color: healthData?.database?.status === 'connected' ? '#10b981' : '#f59e0b' }}>
                {healthData?.database?.status || 'disconnected (pending URI)'}
              </span>
            </div>

            <div className="status-item">
              <span className="status-label">Environment Configured</span>
              <span className="status-value">
                {healthData?.database?.configured ? 'Yes (.env)' : 'Placeholder (.env.example)'}
              </span>
            </div>

            <div className="status-item">
              <span className="status-label">Platform Readiness</span>
              <span className="status-value" style={{ color: '#10b981' }}>
                Foundation Initialized
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
