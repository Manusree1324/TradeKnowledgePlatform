import React from 'react';
import { Zap, Droplet, Wind, Hammer, Flame, Layers } from 'lucide-react';

const trades = [
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    icon: Zap,
    color: '#f59e0b',
    tag: 'NEC Standards',
    desc: 'Load calculations, breaker panel wiring, conduit routing, and safety compliance guides.'
  },
  {
    id: 'plumbing',
    name: 'Plumbing & Piping',
    icon: Droplet,
    color: '#06b6d4',
    tag: 'UPC & IPC Codes',
    desc: 'Drainage-waste-vent systems, backflow prevention, and pipe sizing technical charts.'
  },
  {
    id: 'hvac',
    name: 'HVAC & Climate Control',
    icon: Wind,
    color: '#3b82f6',
    tag: 'ASHRAE Guidelines',
    desc: 'Refrigerant recovery, ductwork sizing, heat loss load metrics, and thermostat diagnostics.'
  },
  {
    id: 'carpentry',
    name: 'Carpentry & Framing',
    icon: Hammer,
    color: '#10b981',
    tag: 'IBC Structural',
    desc: 'Load-bearing timber spans, joist calculations, roof pitch geometry, and joinery methods.'
  },
  {
    id: 'welding',
    name: 'Welding & Metallurgy',
    icon: Flame,
    color: '#ec4899',
    tag: 'AWS Specifications',
    desc: 'SMAW, GTAW (TIG), and GMAW (MIG) parameters, electrode selection, and weld joint design.'
  },
  {
    id: 'masonry',
    name: 'Masonry & Materials',
    icon: Layers,
    color: '#8b5cf6',
    tag: 'ASTM Specifications',
    desc: 'Concrete mix ratios, rebar placement schedules, mortar grading, and foundation waterproofing.'
  }
];

export default function TradeCategories() {
  return (
    <section id="categories">
      <div className="section-header">
        <h2 className="section-title">Trade Documentation Domains</h2>
        <p className="section-subtitle">Comprehensive guides, calculations, and safety standards organized by industrial discipline.</p>
      </div>

      <div className="categories-grid">
        {trades.map((trade) => {
          const IconComponent = trade.icon;
          return (
            <div 
              key={trade.id} 
              className="trade-card"
              style={{ '--card-color': trade.color }}
            >
              <div className="trade-icon-box">
                <IconComponent size={24} />
              </div>
              <h3 className="trade-card-title">{trade.name}</h3>
              <p className="trade-card-desc">{trade.desc}</p>
              <div className="trade-card-footer">
                <span className="badge-tag">{trade.tag}</span>
                <span style={{ fontSize: '0.8rem', color: trade.color, fontWeight: 600 }}>Active Module →</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
