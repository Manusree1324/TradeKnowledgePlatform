import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search practical guides' }) {
  return (
    <form className="search-form" role="search" onSubmit={(event) => { event.preventDefault(); onSubmit?.(); }}>
      <Search size={19} aria-hidden="true" />
      <input aria-label="Search tutorials" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && <button className="icon-button search-clear" type="button" aria-label="Clear search" onClick={() => onChange('')}><X size={16} /></button>}
      <button className="button button-small button-dark" type="submit">Search</button>
    </form>
  );
}