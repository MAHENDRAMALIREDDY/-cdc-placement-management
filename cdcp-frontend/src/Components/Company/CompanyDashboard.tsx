import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import API from '../../api/axios';

interface Job {
  id: number;
  title: string;
  location: string;
  salary: number;
  description: string;
  requirements: string;
  requiredCgpa?: number;
  maxBacklogs?: number;
  applicationDeadline?: string;
}

interface RecruitmentStage {
  id: number;
  stageName: string;
  stageOrder: number;
}

type EditForm = {
  title: string;
  description: string;
  location: string;
  salary: string;
  requirements: string;
  requiredCgpa: string;
  maxBacklogs: string;
  applicationDeadline: string;
};

const emptyForm = (): EditForm => ({
  title: '', description: '', location: '', salary: '',
  requirements: '', requiredCgpa: '', maxBacklogs: '', applicationDeadline: '',
});

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Stages Management state
  const [stagesJob, setStagesJob] = useState<Job | null>(null);
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [newStageName, setNewStageName] = useState('');
  const [newStageOrder, setNewStageOrder] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs');
      setJobs(res.data || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this job? All applicants will be notified.')) return;
    try {
      await API.delete(`/jobs/${id}`);
      fetchJobs();
    } catch {
      alert('Failed to delete job.');
    }
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      salary: job.salary?.toString() || '',
      requirements: job.requirements || '',
      requiredCgpa: job.requiredCgpa?.toString() || '',
      maxBacklogs: job.maxBacklogs?.toString() || '',
      applicationDeadline: job.applicationDeadline || '',
    });
    setSaveMsg('');
  };

  const closeEdit = () => { setEditingJob(null); setSaveMsg(''); };

  const openStages = async (job: Job) => {
    setStagesJob(job);
    try {
      const res = await API.get(`/jobs/${job.id}/stages`);
      setStages(res.data || []);
    } catch {
      setStages([]);
    }
  };
  const closeStages = () => { setStagesJob(null); setStages([]); setNewStageName(''); setNewStageOrder(''); };

  const handleAddStage = async () => {
    if (!newStageName || !newStageOrder || !stagesJob) return;
    try {
      const res = await API.post(`/jobs/${stagesJob.id}/stages`, {
        stageName: newStageName,
        stageOrder: parseInt(newStageOrder)
      });
      setStages([...stages, res.data].sort((a,b) => a.stageOrder - b.stageOrder));
      setNewStageName('');
      setNewStageOrder('');
    } catch {
      alert('Failed to add stage');
    }
  };

  const handleDeleteStage = async (stageId: number) => {
    try {
      await API.delete(`/jobs/stages/${stageId}`);
      setStages(stages.filter(s => s.id !== stageId));
    } catch {
      alert('Failed to delete stage');
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!editingJob) return;
    setSaving(true); setSaveMsg('');
    try {
      await API.put(`/jobs/${editingJob.id}`, {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        salary: editForm.salary ? Number(editForm.salary) : null,
        requirements: editForm.requirements,
        requiredCgpa: editForm.requiredCgpa ? Number(editForm.requiredCgpa) : null,
        maxBacklogs: editForm.maxBacklogs ? Number(editForm.maxBacklogs) : null,
        applicationDeadline: editForm.applicationDeadline || null,
      });
      setSaveMsg('Job updated successfully!');
      fetchJobs();
      setTimeout(closeEdit, 1000);
    } catch {
      setSaveMsg('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>Company Dashboard</h2>
        <p>Welcome! Manage your job postings and applications from here.</p>

        {loading ? <p>Loading...</p> : (
          <>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{jobs.length}</div>
                <div style={styles.statLabel}>Jobs Posted</div>
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>Your Posted Jobs</h3>
            {jobs.length === 0 ? (
              <p>No jobs posted yet. <a href="/company/post-job" style={{ color: '#1a1a2e', fontWeight: 600 }}>Post your first job →</a></p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Salary</th>
                    <th style={styles.th}>Min CGPA</th>
                    <th style={styles.th}>Deadline</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, idx) => (
                    <tr key={job.id} style={idx % 2 === 0 ? styles.evenRow : {}}>
                      <td style={styles.td}>{idx + 1}</td>
                      <td style={styles.td}><strong>{job.title}</strong></td>
                      <td style={styles.td}>{job.location || '—'}</td>
                      <td style={styles.td}>{job.salary ? `₹${job.salary.toLocaleString()}` : '—'}</td>
                      <td style={styles.td}>{job.requiredCgpa ?? '—'}</td>
                      <td style={styles.td}>{job.applicationDeadline || '—'}</td>
                      <td style={styles.td}>
                        <button style={styles.manageBtn} onClick={() => openStages(job)}>⚙️ Stages</button>
                        {' '}
                        <button style={styles.editBtn} onClick={() => openEdit(job)}>✏️ Edit</button>
                        {' '}
                        <button style={styles.deleteBtn} onClick={() => handleDelete(job.id)}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editingJob && (
        <div style={styles.overlay} onClick={closeEdit}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Edit Job — {editingJob.title}</h3>
              <button style={styles.closeBtn} onClick={closeEdit}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.fg}>
                <label style={styles.label}>Job Title *</label>
                <input name="title" style={styles.input} value={editForm.title} onChange={handleEditChange} />
              </div>
              <div style={styles.row}>
                <div style={styles.fg}>
                  <label style={styles.label}>Location</label>
                  <input name="location" style={styles.input} value={editForm.location} onChange={handleEditChange} />
                </div>
                <div style={styles.fg}>
                  <label style={styles.label}>Salary (₹)</label>
                  <input name="salary" type="number" style={styles.input} value={editForm.salary} onChange={handleEditChange} />
                </div>
              </div>
              <div style={styles.fg}>
                <label style={styles.label}>Requirements / Skills</label>
                <textarea name="requirements" rows={2} style={styles.textarea} value={editForm.requirements} onChange={handleEditChange} />
              </div>

              <div style={styles.sectionLabel}>Eligibility Criteria</div>
              <div style={styles.row}>
                <div style={styles.fg}>
                  <label style={styles.label}>Min CGPA</label>
                  <input name="requiredCgpa" type="number" step="0.01" min="0" max="10" style={styles.input} value={editForm.requiredCgpa} onChange={handleEditChange} placeholder="No requirement" />
                </div>
                <div style={styles.fg}>
                  <label style={styles.label}>Max Backlogs</label>
                  <input name="maxBacklogs" type="number" min="0" style={styles.input} value={editForm.maxBacklogs} onChange={handleEditChange} placeholder="No requirement" />
                </div>
                <div style={styles.fg}>
                  <label style={styles.label}>Application Deadline</label>
                  <input name="applicationDeadline" type="date" style={styles.input} value={editForm.applicationDeadline} onChange={handleEditChange} />
                </div>
              </div>
              <div style={styles.fg}>
                <label style={styles.label}>Job Description *</label>
                <textarea name="description" rows={4} style={styles.textarea} value={editForm.description} onChange={handleEditChange} />
              </div>

              {saveMsg && (
                <p style={saveMsg.includes('success') ? styles.successMsg : styles.errorMsg}>{saveMsg}</p>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={closeEdit}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Stages Modal ── */}
      {stagesJob && (
        <div style={styles.overlay} onClick={closeStages}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Manage Stages — {stagesJob.title}</h3>
              <button style={styles.closeBtn} onClick={closeStages}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p>Define custom recruitment stages (like Written Test, HR Interview) that applicants will go through.</p>
              
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={{...styles.th, width: '60px'}}>Order</th>
                    <th style={styles.th}>Stage Name</th>
                    <th style={{...styles.th, width: '80px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stg) => (
                    <tr key={stg.id}>
                      <td style={styles.td}>{stg.stageOrder}</td>
                      <td style={styles.td}><strong>{stg.stageName}</strong></td>
                      <td style={styles.td}>
                        <button style={styles.deleteBtn} onClick={() => handleDeleteStage(stg.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
                  {stages.length === 0 && (
                    <tr><td colSpan={3} style={styles.td}>No custom stages defined.</td></tr>
                  )}
                </tbody>
              </table>

              <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Add New Stage</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input style={styles.input} type="number" placeholder="Order (e.g. 1)" value={newStageOrder} onChange={e => setNewStageOrder(e.target.value)} />
                  <input style={{...styles.input, flex: 1}} type="text" placeholder="Stage Name (e.g. Technical Interview)" value={newStageName} onChange={e => setNewStageName(e.target.value)} />
                  <button style={styles.saveBtn} onClick={handleAddStage}>Add</button>
                </div>
              </div>

            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={closeStages}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px' },
  statsGrid: { display: 'flex', gap: '16px', marginTop: '20px' },
  statCard: { background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '24px 32px', textAlign: 'center', minWidth: '150px' },
  statNumber: { fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e' },
  statLabel: { fontSize: '0.9rem', color: '#666', marginTop: '6px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px', background: '#fff' },
  theadRow: { backgroundColor: '#1a1a2e', color: '#fff' },
  th: { padding: '10px 14px', textAlign: 'left', fontWeight: 'bold' },
  td: { padding: '10px 14px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  manageBtn: { padding: '5px 12px', backgroundColor: '#8e44ad', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  editBtn: { padding: '5px 12px', backgroundColor: '#2980b9', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { padding: '5px 12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },

  // Modal
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: '10px', width: '640px', maxWidth: '95vw',
    maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee' },
  modalBody: { padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #eee' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#666' },
  cancelBtn: { padding: '8px 18px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: '#fff' },
  saveBtn: { padding: '8px 20px', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  row: { display: 'flex', gap: '12px' },
  fg: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#444' },
  input: { padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' },
  textarea: { padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', resize: 'vertical' as const },
  sectionLabel: { fontWeight: 'bold', color: '#1a1a2e', borderBottom: '1px solid #ddd', paddingBottom: '4px' },
  successMsg: { color: '#1e8449', fontWeight: 600 },
  errorMsg: { color: '#c0392b', fontWeight: 600 },
};

export default CompanyDashboard;
