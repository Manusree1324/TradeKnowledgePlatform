import { Link } from 'react-router-dom';

export default function NotFound() {
  return <main className="page-shell not-found"><p className="eyebrow">404 / Off the map</p><h1>This page is not in the manual.</h1><p>The address may have changed, or the page may no longer be available.</p><Link to="/" className="button button-primary">Back to the knowledge feed</Link></main>;
}