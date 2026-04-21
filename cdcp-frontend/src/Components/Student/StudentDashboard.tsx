import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import API from '../../api/axios';

interface Stats {
  totalApplications?: number;
  pendingApplications?: number;
  acceptedApplications?: number;
}

const StudentDashboard = () => {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/applications');
        const apps = res.data || [];
        setStats({
          totalApplications: apps.length,
          pendingApplications: apps.filter((a: any) => a.status === 'PENDING').length,
          acceptedApplications: apps.filter((a: any) => a.status === 'ACCEPTED').length,
        });
      } catch {
        setStats({ totalApplications: 0, pendingApplications: 0, acceptedApplications: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadMessage('Uploading...');
      await API.post('/user/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMessage('Resume uploaded successfully!');
    } catch {
      setUploadMessage('Failed to upload resume.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>Student Dashboard</h2>
        <p>Welcome! View your application stats below.</p>

        <div style={styles.uploadSection}>
          <h3>My Resume</h3>
          <p>Upload a PDF, JPEG, or PNG resume (max 5 MB) for companies to view.</p>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUploadResume} />
          {uploadMessage && <p style={styles.uploadMsg}>{uploadMessage}</p>}
        </div>

        {loading ? (
          <p>Loading stats...</p>
        ) : (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.totalApplications ?? 0}</div>
              <div style={styles.statLabel}>Total Applications</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.pendingApplications ?? 0}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.acceptedApplications ?? 0}</div>
              <div style={styles.statLabel}>Accepted</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px' },
  statsGrid: { display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' },
  statCard: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '24px 32px',
    textAlign: 'center',
    minWidth: '150px',
  },
  statNumber: { fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e' },
  statLabel: { fontSize: '0.9rem', color: '#666', marginTop: '6px' },
  uploadSection: {
    background: '#f9f9f9',
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px',
    marginBottom: '20px'
  },
  uploadMsg: {
    marginTop: '10px',
    fontWeight: 'bold',
    color: '#27ae60'
  }
};

export default StudentDashboard;
