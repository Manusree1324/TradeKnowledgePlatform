import { ArrowUpRight, Eye, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { assetUrl } from '../services/api';

export default function TutorialCard({ tutorial }) {
  const categoryName = tutorial.category?.name || 'Trade guide';
  const date = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(tutorial.createdAt));

  return (
    <article className="tutorial-card">
      {tutorial.images?.[0] && <Link className="tutorial-image" to={`/tutorials/${tutorial._id}`} tabIndex={-1} aria-hidden="true"><img src={assetUrl(tutorial.images[0])} alt="" loading="lazy" /></Link>}
      <div className="tutorial-card-body">
        <div className="card-meta"><span className="category-label">{categoryName}</span><span>{date}</span></div>
        <h2><Link to={`/tutorials/${tutorial._id}`}>{tutorial.title}</Link></h2>
        <p className="tutorial-summary">{tutorial.description}</p>
        <div className="tutorial-card-footer">
          <span className="author-line"><span className="avatar-small">{tutorial.author?.name?.slice(0, 1).toUpperCase() || 'T'}</span>{tutorial.author?.name || 'TradeKnowledge member'}</span>
          <span className="card-stat"><Eye size={15} /> {tutorial.views || 0}</span>
        </div>
        {tutorial.safetyPrecautions?.length > 0 && <span className="safety-note"><ShieldCheck size={14} /> Safety notes included</span>}
      </div>
      <Link className="card-open" to={`/tutorials/${tutorial._id}`} aria-label={`Read ${tutorial.title}`}><ArrowUpRight size={17} /></Link>
    </article>
  );
}