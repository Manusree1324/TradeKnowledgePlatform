import { useEffect, useState } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CommentSection({ tutorialId }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tutorialStatus, setTutorialStatus] = useState('published');

  async function loadComments() {
    setLoading(true);
    setError('');

    try {
      // First check the tutorial status
      const tutorialResponse = await api.get(`/tutorials/${tutorialId}`);
      const tutorial = tutorialResponse.data.tutorial;

      setTutorialStatus(tutorial?.status || 'published');

      // Comments are available only for published tutorials
      if (tutorial?.status !== 'published') {
        setComments([]);
        return;
      }

      // Load comments only when the tutorial is published
      const { data } = await api.get(`/comments/tutorial/${tutorialId}`);
      setComments(data.comments || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        'Comments could not be loaded.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [tutorialId]);

  async function submitComment(event) {
    event.preventDefault();

    if (content.trim().length < 2) {
      return;
    }

    setError('');

    try {
      const { data } = await api.post(
        `/comments/tutorial/${tutorialId}`,
        {
          content: content.trim(),
        }
      );

      setComments((current) => [...current, data.comment]);
      setContent('');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        'Your comment could not be posted.'
      );
    }
  }

  async function deleteComment(id) {
    setError('');

    try {
      await api.delete(`/comments/${id}`);

      setComments((current) =>
        current.filter((comment) => comment._id !== id)
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        'Your comment could not be deleted.'
      );
    }
  }

  const isPublished = tutorialStatus === 'published';

  return (
    <section
      className="comments-section"
      aria-labelledby="comments-heading"
    >
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Field notes</p>

          <h2 id="comments-heading">
            Discussion{' '}
            <span className="count-pill">
              {comments.length}
            </span>
          </h2>
        </div>

        <MessageSquare size={21} />
      </div>

      {/* Pending / rejected / other non-published tutorials */}
      {!isPublished ? (
        <div className="empty-inline">
          <p>
            Discussion will be available after this guide is approved.
          </p>
        </div>
      ) : (
        <>
          {/* Comment form */}
          {user ? (
            <form
              className="comment-form"
              onSubmit={submitComment}
            >
              <label
                className="sr-only"
                htmlFor="comment-content"
              >
                Add a comment
              </label>

              <textarea
                id="comment-content"
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                minLength={2}
                maxLength={2000}
                placeholder="Share a useful clarification or field note…"
                required
              />

              <button
                className="button button-primary"
                type="submit"
                disabled={content.trim().length < 2}
              >
                <Send size={15} />
                Post note
              </button>
            </form>
          ) : (
            <p className="signin-prompt">
              <Link to="/login">Sign in</Link> to join the discussion.
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}

          {/* Loading */}
          {loading ? (
            <p className="loading-line">
              Loading discussion…
            </p>
          ) : comments.length === 0 ? (
            <p className="empty-inline">
              No field notes yet. Start the discussion with a helpful
              observation.
            </p>
          ) : (
            <div className="comment-list">
              {comments.map((comment) => (
                <article
                  className="comment-item"
                  key={comment._id}
                >
                  <span className="avatar-small">
                    {comment.author?.name
                      ?.slice(0, 1)
                      .toUpperCase() || 'T'}
                  </span>

                  <div className="comment-copy">
                    <div className="comment-meta">
                      <strong>
                        {comment.author?.name || 'Member'}
                      </strong>

                      <time>
                        {new Date(
                          comment.createdAt
                        ).toLocaleDateString()}
                      </time>
                    </div>

                    <p>{comment.content}</p>
                  </div>

                  {(user?.role === 'admin' ||
                    user?._id === comment.author?._id) && (
                    <button
                      className="icon-button comment-delete"
                      onClick={() =>
                        deleteComment(comment._id)
                      }
                      aria-label="Delete comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}