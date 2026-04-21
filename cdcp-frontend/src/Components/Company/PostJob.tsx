import { useState, type FormEvent } from 'react';
import Navbar from '../Navbar';
import API from '../../api/axios';

const PostJob = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    requirements: '',
    requiredCgpa: '',
    maxBacklogs: '',
    applicationDeadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    try {
      await API.post('/jobs', {
        ...form,
        salary: form.salary ? Number(form.salary) : undefined,
        requiredCgpa: form.requiredCgpa ? Number(form.requiredCgpa) : undefined,
        maxBacklogs: form.maxBacklogs ? Number(form.maxBacklogs) : undefined,
      });
      setMessage('Job posted successfully!');
      setForm({ title: '', description: '', location: '', salary: '', requirements: '', requiredCgpa: '', maxBacklogs: '', applicationDeadline: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>Post a New Job</h2>
        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Software Engineer" required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore, India" style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Salary (₹)</label>
            <input name="salary" value={form.salary} onChange={handleChange} type="number" placeholder="e.g. 600000" style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Requirements / Skills</label>
            <textarea name="requirements" value={form.requirements} onChange={handleChange} placeholder="List required skills" rows={2} style={styles.textarea} />
          </div>

          <div style={styles.sectionTitle}>Eligibility Criteria</div>
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Minimum CGPA Required</label>
              <input name="requiredCgpa" value={form.requiredCgpa} onChange={handleChange} type="number" step="0.01" min="0" max="10" placeholder="e.g. 7.0 (blank = no requirement)" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Max Backlogs Allowed</label>
              <input name="maxBacklogs" value={form.maxBacklogs} onChange={handleChange} type="number" min="0" placeholder="e.g. 0 (blank = no requirement)" style={styles.input} />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Application Deadline</label>
            <input name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} type="date" style={styles.input} />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Detailed job description" required rows={5} style={styles.textarea} />
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '640px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  row: { display: 'flex', gap: '16px' },
  sectionTitle: { fontWeight: 'bold', color: '#1a1a2e', borderBottom: '2px solid #1a1a2e', paddingBottom: '4px' },
  label: { fontWeight: 500, fontSize: '0.9rem', color: '#333' },
  input: { padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' },
  textarea: { padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', resize: 'vertical' as const },
  btn: { padding: '10px 20px', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', alignSelf: 'flex-start' },
  success: { background: '#d4edda', color: '#155724', padding: '10px 14px', borderRadius: '4px', marginBottom: '12px' },
  error: { background: '#ffe0e0', color: '#c0392b', padding: '10px 14px', borderRadius: '4px', marginBottom: '12px' },
};

export default PostJob;
