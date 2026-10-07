import { useEffect, useState } from 'react';
import { ArrowUpRight, Bike, BrickWall, Cable, Hammer, Wind, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const categoryIcons = { electrical: Cable, plumbing: Wrench, welding: Hammer, hvac: Wind, carpentry: Hammer, automotive: Bike, masonry: BrickWall };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Trade categories could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-shell categories-page">
      <div className="page-title-block"><p className="eyebrow">Find your discipline</p><h1>Knowledge by trade.</h1><p>Browse field-tested methods, reference notes and safety-first tutorials from across the skilled trades.</p></div>
      {error && <div className="state-message error-state" role="alert">{error}</div>}
      {loading ? <div className="category-grid">{[1, 2, 3].map((item) => <div className="skeleton-card" key={item} />)}</div> : <div className="category-grid">{categories.map((category, index) => {
        const Icon = categoryIcons[category.slug] || Wrench;
        return <Link className="category-tile" to={`/?category=${encodeURIComponent(category.slug)}`} key={category._id} style={{ '--tile-index': index }}><span className="category-tile-icon"><Icon size={23} /></span><span className="category-tile-name">{category.name}</span><span className="category-tile-description">{category.description}</span><span className="category-tile-count">{category.tutorialCount} {category.tutorialCount === 1 ? 'guide' : 'guides'} <ArrowUpRight size={16} /></span></Link>;
      })}</div>}
    </main>
  );
}