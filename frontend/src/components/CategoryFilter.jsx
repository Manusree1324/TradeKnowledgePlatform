export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <label className="filter-control">
      <span>Trade</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label="Filter by trade category">
        <option value="">All trades</option>
        {categories.map((category) => <option key={category._id || category.slug} value={category.slug}>{category.name}</option>)}
      </select>
    </label>
  );
}