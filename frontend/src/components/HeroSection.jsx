import React from 'react';
import { BookOpen, ShieldCheck, Zap, Cpu } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-pill">
        <Cpu size={15} /> Full-Stack Internship Platform
      </div>

      <h1 className="hero-title">
        Skilled Trade Knowledge Hub
      </h1>

      <p className="hero-subtitle">
        A centralized technical documentation platform for electrical wiring, plumbing codes, HVAC schematics, high-precision welding standards, and industrial craftsmanship.
      </p>

      <div className="hero-actions">
        <a href="#categories" className="btn-primary">
          <BookOpen size={18} /> Explore Technical Trades
        </a>
        <a href="#status" className="btn-secondary">
          <Zap size={18} /> Verify API Health
        </a>
      </div>
    </section>
  );
}
