import { useEffect, useState } from 'react';
import { ArrowRight, BookOpenCheck, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import TutorialCard from '../components/TutorialCard';
import { api } from '../services/api';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [tutorials, setTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [requestVersion, setRequestVersion] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');

    api.get('/tutorials', {
      params: { search, category, page }
    })
      .then(({ data }) => {
        setTutorials(data.tutorials);
        setPages(data.pages || 1);
      })
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message ||
          'The knowledge feed could not be loaded. Check that the API is running.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, category, page, requestVersion]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setPage(1);
    setSearchParams(next);
  }

  return (
    <main>
      <section className="feed-intro">
        <div className="feed-intro-inner">
          <div className="intro-copy">
            <p className="eyebrow">
              <span className="eyebrow-rule" />
              The knowledge exchange for skilled trades
            </p>

            <h1>
              Good work starts
              <br />
              with <em>good knowledge.</em>
            </h1>

            <p className="intro-description">
              Practical field guides from people who know the work. Learn a
              method, share what you know, and make every job a little better.
            </p>

            <div className="intro-trust">
              <span>
                <BookOpenCheck size={16} /> Practical tutorials
              </span>

              <span>
                <ShieldCheck size={16} /> Safety-first learning
              </span>
            </div>
          </div>

          <div className="intro-side-note">
            <span className="note-number">01</span>

            <p>
              Electrical, plumbing, welding and more. Built for the next
              generation of the trades.
            </p>

            <Link to="/categories">
              Explore all trades <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="feed-section page-shell"
        aria-labelledby="feed-heading"
      >
        <div className="feed-heading-row">
          <div>
            <p className="eyebrow">From the field</p>
            <h2 id="feed-heading">Latest knowledge</h2>
          </div>

          <Link className="text-link" to="/categories">
            Browse trades <ArrowRight size={16} />
          </Link>
        </div>

        <div className="feed-tools">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            onSubmit={() => updateFilter('search', searchText.trim())}
          />

          <CategoryFilter
            categories={categories}
            value={category}
            onChange={(value) => updateFilter('category', value)}
          />
        </div>

        {error && (
          <div className="state-message error-state" role="alert">
            <strong>Feed unavailable</strong>

            <span>{error}</span>

            <button
              className="button button-small button-dark"
              onClick={() =>
                setRequestVersion((current) => current + 1)
              }
            >
              Try again
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="feed-grid" aria-label="Loading tutorials">
            {[1, 2, 3].map((item) => (
              <div className="skeleton-card" key={item} />
            ))}
          </div>
        )}

        {!error && !loading && tutorials.length === 0 && (
          <div className="state-message empty-state">
            <strong>No guides match those filters.</strong>

            <span>
              Try another search or choose all trades.
            </span>

            <button
              className="text-link"
              onClick={() => {
                setSearchText('');
                setSearchParams({});
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {!error && !loading && tutorials.length > 0 && (
          <div className="feed-grid">
            {tutorials.map((tutorial) => (
              <TutorialCard
                key={tutorial._id}
                tutorial={tutorial}
              />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            <button
              className="button button-outline"
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              disabled={page <= 1}
            >
              Previous
            </button>

            <span>
              Page {page} of {pages}
            </span>

            <button
              className="button button-outline"
              onClick={() =>
                setPage((current) =>
                  Math.min(pages, current + 1)
                )
              }
              disabled={page >= pages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}