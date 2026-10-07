import { useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, Eye, Pencil, ShieldAlert, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CommentSection from '../components/CommentSection';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';
import { api, assetUrl } from '../services/api';

export default function TutorialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [tutorial, setTutorial] = useState(null);
  const [rating, setRating] = useState({
    average: 0,
    count: 0,
    userRating: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTutorial() {
      setLoading(true);
      setError('');

      try {
        // First load the tutorial
        const tutorialResult = await api.get(`/tutorials/${id}`);
        const loadedTutorial = tutorialResult.data.tutorial;

        setTutorial(loadedTutorial);

        // Ratings are available only for published tutorials
        if (loadedTutorial.status === 'published') {
          try {
            const ratingResult = await api.get(`/ratings/${id}`);
            setRating(ratingResult.data);
          } catch {
            // Keep default rating values if ratings cannot be loaded
            setRating({
              average: 0,
              count: 0,
              userRating: null
            });
          }
        } else {
          setRating({
            average: 0,
            count: 0,
            userRating: null
          });
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
          'This tutorial could not be loaded.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadTutorial();
  }, [id]);

  async function toggleBookmark() {
    setSaving(true);
    setActionError('');

    try {
      const saved = user.bookmarks?.some(
        (bookmark) =>
          (bookmark._id || bookmark).toString() === id
      );

      await api.request({
        method: saved ? 'delete' : 'post',
        url: `/bookmarks/${id}`
      });

      await refreshUser();
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
        'Bookmark could not be updated.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitRating(value) {
    setActionError('');

    try {
      await api.put(`/ratings/${id}`, { value });

      const { data } = await api.get(`/ratings/${id}`);
      setRating(data);
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
        'Rating could not be saved.'
      );
    }
  }

  async function deleteTutorial() {
    if (
      !window.confirm(
        'Delete this tutorial and its discussion? This cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await api.delete(`/tutorials/${id}`);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
        'Tutorial could not be deleted.'
      );
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <p className="loading-line">Loading tutorial…</p>
      </main>
    );
  }

  if (error || !tutorial) {
    return (
      <main className="page-shell">
        <div className="state-message error-state">
          <strong>Guide unavailable</strong>
          <span>
            {error || 'This tutorial could not be found.'}
          </span>
          <Link className="text-link" to="/">
            Return to the feed
          </Link>
        </div>
      </main>
    );
  }

  const ownsTutorial =
    user &&
    (user._id === tutorial.author?._id || user.role === 'admin');

  const isBookmarked = user?.bookmarks?.some(
    (bookmark) =>
      (bookmark._id || bookmark).toString() === id
  );

  return (
    <main className="page-shell detail-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Knowledge feed
      </Link>

      <article>
        <header className="article-header">
          <div className="article-kicker">
            <span className="category-label">
              {tutorial.category?.name}
            </span>

            {tutorial.status !== 'published' && (
              <span
                className={`status-tag status-${tutorial.status}`}
              >
                {tutorial.status}
              </span>
            )}
          </div>

          <h1>{tutorial.title}</h1>

          <p className="article-lede">
            {tutorial.description}
          </p>

          <div className="article-byline">
            <span className="avatar-small">
              {tutorial.author?.name?.slice(0, 1).toUpperCase()}
            </span>

            <span>
              By <strong>{tutorial.author?.name}</strong>
              <small>
                {tutorial.author?.tradeSpecialization ||
                  'Trade community member'}
              </small>
            </span>

            <span className="byline-divider" />

            <span>
              {new Date(tutorial.createdAt).toLocaleDateString(
                undefined,
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }
              )}
            </span>

            <span className="article-views">
              <Eye size={15} /> {tutorial.views} views
            </span>
          </div>

          <div className="article-actions">
            {user && tutorial.status === 'published' && (
              <button
                className={`button ${
                  isBookmarked
                    ? 'button-saved'
                    : 'button-outline'
                }`}
                onClick={toggleBookmark}
                disabled={saving}
              >
                <Bookmark
                  size={16}
                  fill={
                    isBookmarked ? 'currentColor' : 'none'
                  }
                />

                {isBookmarked ? 'Saved' : 'Save guide'}
              </button>
            )}

            {ownsTutorial && (
              <>
                <Link
                  className="button button-outline"
                  to={`/tutorials/${id}/edit`}
                >
                  <Pencil size={15} /> Edit
                </Link>

                <button
                  className="icon-button danger-icon"
                  onClick={deleteTutorial}
                  aria-label="Delete tutorial"
                >
                  <Trash2 size={17} />
                </button>
              </>
            )}
          </div>

          {actionError && (
            <p className="inline-error" role="alert">
              {actionError}
            </p>
          )}
        </header>

        {tutorial.images?.length > 0 && (
          <div className="article-image-strip">
            {tutorial.images.map((image, index) => (
              <img
                key={image}
                src={assetUrl(image)}
                alt={`${tutorial.title}, photo ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="article-layout">
          <div className="article-body">
            <section className="prose-section">
              <p className="eyebrow">The method</p>
              <h2>Before you begin</h2>

              <p className="article-content">
                {tutorial.content}
              </p>
            </section>

            <section className="prose-section">
              <p className="eyebrow">On the job</p>
              <h2>Step by step</h2>

              <ol className="steps-list">
                {tutorial.steps.map((step, index) => (
                  <li
                    key={`${step.title}-${index}`}
                  >
                    <span className="step-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="safety-panel">
              <div className="safety-panel-heading">
                <ShieldAlert size={20} />

                <div>
                  <p className="eyebrow">
                    Work within your training and local code
                  </p>

                  <h2>Safety precautions</h2>
                </div>
              </div>

              <ul>
                {tutorial.safetyPrecautions.map(
                  (item, index) => (
                    <li key={`${item}-${index}`}>
                      {item}
                    </li>
                  )
                )}
              </ul>

              <p className="safety-disclaimer">
                This guide is for general learning and does
                not replace site-specific risk assessment,
                applicable code, manufacturer instructions,
                or qualified supervision.
              </p>
            </section>

            {tutorial.status === 'published' ? (
              <section className="rating-panel">
                <div>
                  <p className="eyebrow">
                    Community rating
                  </p>

                  <strong className="rating-score">
                    {rating.average
                      ? rating.average.toFixed(1)
                      : 'New'}
                  </strong>

                  <span>
                    {rating.count}{' '}
                    {rating.count === 1
                      ? 'rating'
                      : 'ratings'}
                  </span>
                </div>

                <div>
                  {user ? (
                    <>
                      <p className="field-hint">
                        Your rating
                      </p>

                      <RatingStars
                        value={rating.userRating || 0}
                        onSelect={submitRating}
                      />
                    </>
                  ) : (
                    <p className="signin-prompt">
                      <Link to="/login">Sign in</Link>{' '}
                      to rate this guide.
                    </p>
                  )}
                </div>
              </section>
            ) : (
              <section className="rating-panel">
                <div>
                  <p className="eyebrow">
                    Community rating
                  </p>

                  <strong className="rating-score">
                    Pending
                  </strong>

                  <span>
                    Ratings become available after the guide
                    is approved.
                  </span>
                </div>
              </section>
            )}

            <CommentSection tutorialId={id} />
          </div>

          <aside className="article-aside">
            <p className="eyebrow">
              Guide details
            </p>

            <dl>
              <div>
                <dt>Trade</dt>
                <dd>{tutorial.category?.name}</dd>
              </div>

              <div>
                <dt>Steps</dt>
                <dd>{tutorial.steps.length}</dd>
              </div>

              <div>
                <dt>Safety checks</dt>
                <dd>
                  {tutorial.safetyPrecautions.length}
                </dd>
              </div>

              <div>
                <dt>Reading time</dt>
                <dd>
                  {Math.max(
                    1,
                    Math.ceil(
                      tutorial.content.split(/\s+/).length /
                        200
                    )
                  )}{' '}
                  min
                </dd>
              </div>
            </dl>

            {tutorial.status === 'rejected' &&
              tutorial.moderationNote && (
                <p className="moderation-note">
                  Review note: {tutorial.moderationNote}
                </p>
              )}
          </aside>
        </div>
      </article>
    </main>
  );
}