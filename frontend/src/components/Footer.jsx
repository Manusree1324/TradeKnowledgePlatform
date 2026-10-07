import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link className="brand footer-brand" to="/"><span className="brand-mark"><img src="/logo.svg" alt="" /></span><span>Trade<span className="brand-highlight">Knowledge</span></span></Link>
        <p>Practical knowledge, shared by the people who do the work.</p>
        <span className="footer-copy">© {new Date().getFullYear()} TradeKnowledge</span>
      </div>
    </footer>
  );
}