import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import API from '../../api/axios';

interface Application {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  jobTitle: string;
  appliedDate: string;
  status: string;
  currentStage?: string;
}

interface Job {
  id: number;
  title: string;
}

interface RecruitmentStage {
  id: number;
  stageName: string;
  stageOrder: number;
}

const STATUS_OPTIONS = ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'SELECTED', 'REJECTED'];

const CompanyApplications = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get('/jobs');
        setJobs(res.data || []);
      } catch {
        setJobs([]);
      }
    };
    fetchJobs();
  }, []);

  const fetchApplications = async (jobId: string) => {
    if (!jobId) return;
    setLoading(true);
    setApplications([]);
    try {
      const res = await API.get(`/applications?jobId=${jobId}`);
      setApplications(res.data || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStages = async (jobId: string) => {
    if (!jobId) return;
    try {
      const res = await API.get(`/jobs/${jobId}/stages`);
      setStages(res.data || []);
    } catch {
      setStages([]);
    }
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedJobId(val);
    fetchApplications(val);
    fetchStages(val);
  };

  const handleStatusUpdate = async (appId: number, newStatus: string) => {
    setUpdatingId(appId);
    setMessage('');
    try {
      await API.put(`/applications/${appId}`, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      setMessage(`Application #${appId} status updated to ${newStatus}`);
    } catch {
      setMessage(`Failed to update status for application #${appId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStageUpdate = async (appId: number, newStage: string) => {
    setUpdatingId(appId);
    setMessage('');
    try {
      await API.put(`/applications/${appId}`, { currentStage: newStage });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, currentStage: newStage } : a))
      );
      setMessage(`Application #${appId} stage updated to ${newStage || 'N/A'}`);
    } catch {
      setMessage(`Failed to update stage for application #${appId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOfferUpload = async (appId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post(`/applications/${appId}/offer`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage(`Offer letter uploaded for application #${appId}`);
    } catch {
      setMessage('Failed to upload offer letter.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>Applicants</h2>

        {message && <div style={styles.info}>{message}</div>}

        <div style={styles.filterRow}>
          <label style={styles.label}>Filter by Job:</label>
          <select value={selectedJobId} onChange={handleJobChange} style={styles.select}>
            <option value="">-- Select a Job --</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading applicants...</p>
        ) : applications.length === 0 && selectedJobId ? (
          <p>No applicants found for this job.</p>
        ) : applications.length === 0 ? (
          <p>Select a job to view applicants.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Student Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Resume</th>
                <th style={styles.th}>Applied Date</th>
                <th style={styles.th}>Current Stage</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Update Status</th>
                <th style={styles.th}>Offer Letter</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => (
                <tr key={app.id} style={idx % 2 === 0 ? styles.evenRow : {}}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>{app.studentName}</td>
                  <td style={styles.td}>{app.studentEmail}</td>
                  <td style={styles.td}>
                    {app.studentId ? (
                      <a href={`http://localhost:8080/user/resume/${app.studentId}`} target="_blank" rel="noreferrer" style={styles.downloadLink}>
                        Download
                      </a>
                    ) : 'N/A'}
                  </td>
                  <td style={styles.td}>
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={styles.td}>
                    {stages.length > 0 ? (
                      <select
                        value={app.currentStage || ''}
                        onChange={(e) => handleStageUpdate(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        style={styles.statusSelect}
                      >
                        <option value="">-- Set Stage --</option>
                        {stages.map((s) => (
                          <option key={s.id} value={s.stageName}>{s.stageName}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{color: '#999', fontSize: '0.9em'}}>No stages defined</span>
                    )}
                  </td>
                  <td style={styles.td}>{app.status}</td>
                  <td style={styles.td}>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                      disabled={updatingId === app.id}
                      style={styles.statusSelect}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={styles.td}>
                    {app.status === 'SELECTED' ? (
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        title="Upload Offer Letter"
                        onChange={(e) => e.target.files && handleOfferUpload(app.id, e.target.files[0])}
                      />
                    ) : <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Set SELECTED first</span>}
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
  filterRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  label: { fontWeight: 500, color: '#333' },
  select: { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff' },
  theadRow: { backgroundColor: '#1a1a2e', color: '#fff' },
  th: { padding: '10px 14px', textAlign: 'left', fontWeight: 600 },
  td: { padding: '10px 14px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  statusSelect: { padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px' },
  info: {
    background: '#d4edda',
    color: '#155724',
    padding: '10px 14px',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  downloadLink: {
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default CompanyApplications;
