import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import TutorialCard from '../components/TutorialCard';
import { api } from '../services/api';

export default function Bookmarks() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/bookmarks').then(({ data }) => setTutorials(data.tutorials))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Saved guides could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-shell bookmarks-page">
      <div className="page-title-block"><p className="eyebrow">Your reading list</p><h1>Saved for the next job.</h1><p>Keep useful tutorials close by returning to this list whenever you need a refresher.</p></div>
      {error && <div className="state-message error-state" role="alert">{error}</div>}
      {loading ? <div className="feed-grid"><div className="skeleton-card" /><div className="skeleton-card" /></div> : tutorials.length ? <div className="feed-grid">{tutorials.map((tutorial) => <TutorialCard tutorial={tutorial} key={tutorial._id} />)}</div> : <div className="state-message empty-state"><Bookmark size={21} /><strong>Your saved list is empty.</strong><span>Use “Save guide” on any published tutorial to keep it handy.</span></div>}
    </main>
  );
}