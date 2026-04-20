import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import API from '../../api/axios';

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: string;
  offerLetterFilename?: string;
}

const statusColors: Record<string, React.CSSProperties> = {
  PENDING: { color: '#d68910', fontWeight: 600 },
  ACCEPTED: { color: '#1e8449', fontWeight: 600 },
  SELECTED: { color: '#1a5276', fontWeight: 600 },
  REJECTED: { color: '#c0392b', fontWeight: 600 },
  UNDER_REVIEW: { color: '#884ea0', fontWeight: 600 },
  'JOB DELETED': { color: '#7f8c8d', fontStyle: 'italic', fontWeight: 600 },
};

const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await API.get('/applications');
        setApplications(res.data || []);
      } catch {
        showError('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleDownloadOffer = async (app: Application) => {
    setDownloadingId(app.id);
    try {
      const res = await API.get(`/applications/${app.id}/offer`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = app.offerLetterFilename || `offer_letter_${app.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showError('Failed to download offer letter.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>My Applications</h2>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p>You have not applied to any jobs yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Job Title</th>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Applied Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Offer Letter</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => (
                <tr key={app.id} style={idx % 2 === 0 ? styles.evenRow : {}}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>{app.jobTitle}</td>
                  <td style={styles.td}>{app.company}</td>
                  <td style={styles.td}>
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ ...styles.td, ...(statusColors[app.status] || {}) }}>
                    {app.status}
                  </td>
                  <td style={styles.td}>
                    {app.status === 'SELECTED' ? (
                      <button
                        onClick={() => handleDownloadOffer(app)}
                        disabled={downloadingId === app.id}
                        style={styles.downloadBtn}
                      >
                        {downloadingId === app.id ? '⏳ Downloading...' : '📄 Download Offer'}
                      </button>
                    ) : <span style={{ color: '#ccc', fontSize: '0.8rem' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px', background: '#fff' },
  theadRow: { backgroundColor: '#1a1a2e', color: '#fff' },
  th: { padding: '10px 14px', textAlign: 'left', fontWeight: 600 },
  td: { padding: '10px 14px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  error: {
    background: '#ffe0e0',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  downloadBtn: {
    padding: '5px 12px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
  },
};

export default MyApplications;
