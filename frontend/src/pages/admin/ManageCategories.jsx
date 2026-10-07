import { useEffect, useState } from 'react';
import { FolderTree, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const emptyForm = { name: '', description: '', slug: '' };

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [values, setValues] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadCategories() {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Trade categories could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);

  function editCategory(category) {
    setEditingId(category._id);
    setValues({ name: category.name, description: category.description || '', slug: category.slug });
    setError('');
  }

  function resetForm() {
    setEditingId(null);
    setValues(emptyForm);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) await api.put(`/categories/${editingId}`, values);
      else await api.post('/categories', values);
      resetForm();
      await loadCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Category could not be saved. Check for duplicate names or slugs.');
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(category) {
    if (!window.confirm(`Delete the ${category.name} category? Categories with tutorials cannot be deleted.`)) return;
    try {
      await api.delete(`/categories/${category._id}`);
      setCategories((current) => current.filter((item) => item._id !== category._id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Category could not be deleted.');
    }
  }

  return (
    <main className="page-shell admin-page">
      <div className="dashboard-welcome"><div><p className="eyebrow">Administration / Taxonomy</p><h1>Trade categories</h1><p>Keep the knowledge library organized around the work people do.</p></div></div>
      <nav className="admin-tabs"><Link to="/admin">Overview</Link><Link to="/admin/tutorials">Tutorial review</Link><Link to="/admin/users">Members</Link><Link className="active" to="/admin/categories">Trade categories</Link></nav>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="category-admin-layout">
        <form className="category-editor" onSubmit={submit}>
          <div><p className="eyebrow">{editingId ? 'Edit category' : 'Add a trade'}</p><h2>{editingId ? 'Update category' : 'New category'}</h2></div>
          <label className="field-label">Name<input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} required minLength={2} maxLength={80} /></label>
          <label className="field-label">Description<textarea value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} maxLength={500} rows={4} /></label>
          <label className="field-label">URL slug <span className="field-hint">Optional; generated from the name if left blank</span><input value={values.slug} onChange={(event) => setValues({ ...values, slug: event.target.value })} maxLength={100} /></label>
          <div className="category-editor-actions"><button className="button button-primary" type="submit" disabled={saving}>{editingId ? <Pencil size={15} /> : <Plus size={15} />}{saving ? 'Saving…' : editingId ? 'Save category' : 'Add category'}</button>{editingId && <button className="button button-outline" type="button" onClick={resetForm}><X size={15} /> Cancel</button>}</div>
        </form>
        <section className="category-admin-list"><div className="section-heading-row"><div><p className="eyebrow">Current taxonomy</p><h2><FolderTree size={19} /> {categories.length} categories</h2></div></div>{loading ? <p className="loading-line">Loading categories…</p> : categories.map((category) => <article className="category-admin-row" key={category._id}><div><strong>{category.name}</strong><span>{category.slug} · {category.tutorialCount} published guides</span><p>{category.description}</p></div><div><button className="icon-button" onClick={() => editCategory(category)} aria-label={`Edit ${category.name}`}><Pencil size={16} /></button><button className="icon-button danger-icon" onClick={() => removeCategory(category)} aria-label={`Delete ${category.name}`}><Trash2 size={16} /></button></div></article>)}</section>
      </div>
    </main>
  );
}