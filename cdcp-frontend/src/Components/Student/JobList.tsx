import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import API from '../../api/axios';

interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: number;
  requiredCgpa?: number;
  maxBacklogs?: number;
  applicationDeadline?: string;
}

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          API.get('/jobs'),
          API.get('/applications')
        ]);
        setJobs(jobsRes.data || []);
        
        const appliedIds = (appsRes.data || []).map((app: any) => app.jobId);
        setAppliedJobIds(appliedIds);
      } catch {
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApply = async (jobId: number) => {
    setApplyingId(jobId);
    setMessage('');
    try {
      await API.post('/applications', { jobId });
      setMessage(`Successfully applied for job #${jobId}`);
      setAppliedJobIds(prev => [...prev, jobId]);
    } catch (err: any) {
      setMessage(err.response?.data?.message || `Failed to apply for job #${jobId}`);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>Available Jobs</h2>

        {message && <div style={styles.info}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p>No jobs available at the moment.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Salary</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Eligibility</th>
                <th style={styles.th}>Deadline</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, idx) => (
                <tr key={job.id} style={idx % 2 === 0 ? styles.evenRow : {}}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>{job.title}</td>
                  <td style={styles.td}>{job.company}</td>
                  <td style={styles.td}>{job.location}</td>
                  <td style={styles.td}>{job.salary ? `₹${job.salary.toLocaleString()}` : 'N/A'}</td>
                  <td style={styles.td}>{job.description}</td>
                  <td style={styles.td}>
                    {job.requiredCgpa != null ? <div>Min CGPA: {job.requiredCgpa}</div> : null}
                    {job.maxBacklogs != null ? <div>Max Backlogs: {job.maxBacklogs}</div> : null}
                    {job.requiredCgpa == null && job.maxBacklogs == null ? 'No restriction' : null}
                  </td>
                  <td style={styles.td}>{job.applicationDeadline || '—'}</td>
                  <td style={styles.td}>
                    {appliedJobIds.includes(job.id) ? (
                      <button style={{ ...styles.applyBtn, backgroundColor: '#95a5a6', cursor: 'not-allowed' }} disabled>
                        Applied
                      </button>
                    ) : (
                      <button
                        style={styles.applyBtn}
                        onClick={() => handleApply(job.id)}
                        disabled={applyingId === job.id}
                      >
                        {applyingId === job.id ? 'Applying...' : 'Apply'}
                      </button>
                    )}
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
  applyBtn: {
    padding: '6px 14px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  info: {
    background: '#d4edda',
    color: '#155724',
    padding: '10px 14px',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  error: {
    background: '#ffe0e0',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: '4px',
    marginBottom: '12px',
  },
};

export default JobList;
