import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import API from '../../api/axios';

interface ProfileData {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  cgpa?: number;
  backlogCount?: number;
  skills?: string;
  hasResume?: boolean;
}

const StudentProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', department: '', cgpa: '', backlogCount: '', skills: '' });
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/user/profile');
        const p = res.data;
        setProfile(p);
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          department: p.department || '',
          cgpa: p.cgpa?.toString() || '',
          backlogCount: p.backlogCount?.toString() || '',
          skills: p.skills || '',
        });
      } catch {
        setSaveMsg('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaveMsg('Saving...');
      await API.put('/user/profile', { ...form });
      setSaveMsg('Profile saved successfully!');
    } catch {
      setSaveMsg('Failed to save profile.');
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploadMsg('Uploading...');
      await API.post('/user/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadMsg('Resume uploaded successfully!');
      setProfile(prev => prev ? { ...prev, hasResume: true } : prev);
    } catch {
      setUploadMsg('Failed to upload resume.');
    }
  };

  if (loading) return <><Navbar /><div style={styles.container}><p>Loading profile...</p></div></>;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>My Profile</h2>
        <p style={styles.sub}>Complete your profile so companies can verify your eligibility when you apply for jobs.</p>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Personal Information</h3>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>First Name</label>
              <input style={styles.input} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="e.g. John" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last Name</label>
              <input style={styles.input} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="e.g. Smith" />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Department</label>
            <input style={styles.input} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Computer Science and Engineering" />
          </div>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>CGPA</label>
              <input style={styles.input} type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))} placeholder="e.g. 8.5" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Active Backlogs</label>
              <input style={styles.input} type="number" min="0" value={form.backlogCount} onChange={e => setForm(f => ({ ...f, backlogCount: e.target.value }))} placeholder="e.g. 0" />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Skills (comma separated)</label>
            <input style={styles.input} value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="e.g. Java, React, Python" />
          </div>

          {saveMsg && <p style={saveMsg.includes('success') ? styles.success : styles.error}>{saveMsg}</p>}
          <button style={styles.saveBtn} onClick={handleSave}>Save Profile</button>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Resume</h3>
          <p>Status: {profile?.hasResume ? <span style={styles.badge}>✓ Uploaded</span> : <span style={styles.badgeGray}>Not uploaded</span>}</p>
          <p style={{ fontSize: '0.85rem', color: '#666' }}>Accepted formats: PDF, DOC, DOCX</p>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
          {uploadMsg && <p style={uploadMsg.includes('success') ? styles.success : styles.error}>{uploadMsg}</p>}
        </div>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
  sub: { color: '#555', marginBottom: '20px' },
  card: { background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '24px', marginBottom: '20px' },
  cardTitle: { marginTop: 0, marginBottom: '16px', color: '#1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '0.9rem', color: '#333' },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box' },
  saveBtn: { padding: '10px 20px', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  success: { color: '#1e8449', fontWeight: 600 },
  error: { color: '#c0392b', fontWeight: 600 },
  badge: { backgroundColor: '#d4edda', color: '#1e8449', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' },
  badgeGray: { backgroundColor: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '4px' },
};

export default StudentProfile;
