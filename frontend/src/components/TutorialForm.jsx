import { useEffect, useState } from 'react';
import { ArrowLeft, ImagePlus, Plus, Trash2, Upload } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, assetUrl } from '../services/api';

const emptyTutorial = {
  title: '', description: '', content: '', category: '', images: [],
  steps: [{ title: '', description: '' }], safetyPrecautions: ['']
};

export default function TutorialForm({ editing = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(emptyTutorial);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => setError('Trade categories could not be loaded.'));
    if (!editing) return;
    api.get(`/tutorials/${id}`)
      .then(({ data }) => {
        const tutorial = data.tutorial;
        setValues({
          title: tutorial.title,
          description: tutorial.description,
          content: tutorial.content,
          category: tutorial.category?.slug || tutorial.category?._id || '',
          images: tutorial.images || [],
          steps: tutorial.steps?.length ? tutorial.steps : emptyTutorial.steps,
          safetyPrecautions: tutorial.safetyPrecautions?.length ? tutorial.safetyPrecautions : ['']
        });
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'This tutorial could not be loaded.'))
      .finally(() => setLoading(false));
  }, [editing, id]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateStep(index, field, value) {
    setValues((current) => ({ ...current, steps: current.steps.map((step, stepIndex) => stepIndex === index ? { ...step, [field]: value } : step) }));
  }

  async function uploadImages(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (values.images.length + files.length > 8) {
      setError('Add no more than 8 images to one tutorial.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const paths = [];
      for (const file of files) {
        const payload = new FormData();
        payload.append('image', file);
        const { data } = await api.post('/uploads', payload);
        paths.push(data.imageUrl);
      }
      setValues((current) => ({ ...current, images: [...current.images, ...paths] }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'One or more images could not be uploaded.');
    } finally {
      setUploading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    const payload = {
      ...values,
      steps: values.steps.map(({ title, description }) => ({ title: title.trim(), description: description.trim() })),
      safetyPrecautions: values.safetyPrecautions.map((item) => item.trim())
    };
    setSubmitting(true);
    try {
      const { data } = editing
        ? await api.put(`/tutorials/${id}`, payload)
        : await api.post('/tutorials', payload);
      navigate(`/tutorials/${data.tutorial._id}`, { replace: true });
    } catch (requestError) {
      const validation = requestError.response?.data?.errors?.map((item) => item.message).join(' ');
      setError(validation || requestError.response?.data?.message || 'The tutorial could not be saved.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="page-shell"><p className="loading-line">Loading tutorial…</p></main>;

  return (
    <main className="page-shell editor-page">
      <Link to={editing ? `/tutorials/${id}` : '/dashboard'} className="back-link"><ArrowLeft size={16} /> {editing ? 'Back to tutorial' : 'Back to dashboard'}</Link>
      <div className="editor-heading"><p className="eyebrow">Contribute to the field</p><h1>{editing ? 'Refine your guide' : 'Share what works.'}</h1><p>Clear steps and safety notes help another tradesperson put your experience to work.</p></div>
      <form className="editor-form" onSubmit={submit}>
        {error && <p className="form-error" role="alert">{error}</p>}
        <section className="editor-section"><div className="editor-section-title"><span>01</span><div><h2>Guide overview</h2><p>Give readers enough context to decide if this guide fits their task.</p></div></div>
          <label className="field-label">Title<input value={values.title} onChange={(event) => update('title', event.target.value)} required minLength={8} maxLength={160} placeholder="For example, Diagnose a noisy bathroom exhaust fan" /></label>
          <label className="field-label">Short description<textarea value={values.description} onChange={(event) => update('description', event.target.value)} required minLength={20} maxLength={500} rows={3} placeholder="What will a reader learn or be able to do?" /></label>
          <label className="field-label">Trade category<select value={values.category} onChange={(event) => update('category', event.target.value)} required><option value="">Choose a trade</option>{categories.map((category) => <option key={category._id} value={category.slug}>{category.name}</option>)}</select></label>
          <label className="field-label">Guide content<textarea value={values.content} onChange={(event) => update('content', event.target.value)} required minLength={80} maxLength={30000} rows={7} placeholder="Add background, measurements, code references, and other helpful context." /></label>
        </section>
        <section className="editor-section"><div className="editor-section-title"><span>02</span><div><h2>Practical steps</h2><p>Break the method into clear, ordered actions.</p></div></div>
          {values.steps.map((step, index) => <div className="repeat-field" key={`step-${index}`}><div className="repeat-heading"><strong>Step {index + 1}</strong>{values.steps.length > 1 && <button type="button" className="icon-button" aria-label={`Remove step ${index + 1}`} onClick={() => update('steps', values.steps.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button>}</div><label className="field-label">Step title<input value={step.title} onChange={(event) => updateStep(index, 'title', event.target.value)} required minLength={3} maxLength={160} /></label><label className="field-label">What to do<textarea value={step.description} onChange={(event) => updateStep(index, 'description', event.target.value)} required minLength={10} maxLength={2000} rows={3} /></label></div>)}
          <button type="button" className="button button-outline" disabled={values.steps.length >= 30} onClick={() => update('steps', [...values.steps, { title: '', description: '' }])}><Plus size={16} /> Add a step</button>
        </section>
        <section className="editor-section safety-editor"><div className="editor-section-title"><span>03</span><div><h2>Safety precautions</h2><p>Every guide needs specific hazards and controls. Do not describe hazardous work as risk-free.</p></div></div>
          {values.safetyPrecautions.map((precaution, index) => <div className="repeat-input" key={`safety-${index}`}><label className="sr-only" htmlFor={`safety-${index}`}>Safety precaution {index + 1}</label><input id={`safety-${index}`} value={precaution} onChange={(event) => update('safetyPrecautions', values.safetyPrecautions.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} required minLength={8} maxLength={500} placeholder="Name a hazard and the control needed before work begins" />{values.safetyPrecautions.length > 1 && <button type="button" className="icon-button" aria-label={`Remove safety precaution ${index + 1}`} onClick={() => update('safetyPrecautions', values.safetyPrecautions.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button>}</div>)}
          <button type="button" className="button button-outline" disabled={values.safetyPrecautions.length >= 30} onClick={() => update('safetyPrecautions', [...values.safetyPrecautions, ''])}><Plus size={16} /> Add a precaution</button>
        </section>
        <section className="editor-section"><div className="editor-section-title"><span>04</span><div><h2>Images <span className="field-hint">Optional</span></h2><p>Upload clear JPEG, PNG or WebP photos (5 MB max each).</p></div></div>
          <label className="upload-drop"><ImagePlus size={20} /><span>{uploading ? 'Uploading image…' : 'Choose images'}</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading || values.images.length >= 8} onChange={uploadImages} /></label>
          {values.images.length > 0 && <div className="image-preview-grid">{values.images.map((image, index) => <figure key={image}><img src={assetUrl(image)} alt={`Tutorial image ${index + 1}`} /><button className="image-remove" type="button" aria-label={`Remove image ${index + 1}`} onClick={() => update('images', values.images.filter((item) => item !== image))}><Trash2 size={15} /></button></figure>)}</div>}
        </section>
        <div className="editor-actions"><p>{editing ? 'Changes are saved to your guide.' : 'New guides are reviewed by an administrator before they appear in the public feed.'}</p><button className="button button-primary" type="submit" disabled={submitting || uploading}>{submitting ? 'Saving…' : <><Upload size={16} /> {editing ? 'Save changes' : 'Submit for review'}</>}</button></div>
      </form>
    </main>
  );
}