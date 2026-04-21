import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import API from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

interface Stats {
  totalStudents: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  totalPlacements: number;
}

interface UserEntry {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  cgpa?: number;
}

interface DeptReport { 
  department: string; 
  totalStudents: number; 
  placedStudents: number; 
  placementPercentage: number; 
}

interface StudentReport { 
  studentId: number; 
  name: string; 
  department: string; 
  appsCount: number; 
  status: string; 
}

interface FeedbackEntry {
  id: number;
  userEmail: string;
  userRole: string;
  rating: number;
  comments: string;
  submittedAt: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [companyStats, setCompanyStats] = useState<Record<string, number>>({});
  const [deptReports, setDeptReports] = useState<DeptReport[]>([]);
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'feedback'>('overview');
  const [message, setMessage] = useState('');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, compRes, deptRes, stRes, fbRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/company-stats'),
        API.get('/admin/reports/department'),
        API.get('/admin/reports/student'),
        API.get('/feedback'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setCompanyStats(compRes.data || {});
      setDeptReports(deptRes.data || []);
      setStudentReports(stRes.data || []);
      setFeedbacks(fbRes.data || []);
    } catch {
      showMessage('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, email: string) => {
    if (!window.confirm(`Delete user "${email}"? This action cannot be undone.`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      showMessage(`User "${email}" deleted.`);
    } catch {
      showMessage('Failed to delete user.');
    }
  };

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: '8px 18px',
    cursor: 'pointer',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #1a1a2e' : '3px solid transparent',
    background: 'none',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    fontSize: '0.95rem',
  });

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>Admin Dashboard</h2>
        <p>Career Development & Placement Management System — Placement Officer Control Panel</p>

        {message && <div style={styles.info}>{message}</div>}

        <div style={styles.tabs}>
          <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
          <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>User Management</button>
          <button style={tabStyle('reports')} onClick={() => setActiveTab('reports')}>Reports</button>
          <button style={tabStyle('feedback')} onClick={() => setActiveTab('feedback')}>Feedback</button>
        </div>

        {loading ? <p>Loading...</p> : (
          <>
            {activeTab === 'overview' && stats && (
              <div style={styles.statsGrid}>
                {[
                  { label: 'Students Registered', value: stats.totalStudents },
                  { label: 'Companies', value: stats.totalCompanies },
                  { label: 'Jobs Posted', value: stats.totalJobs },
                  { label: 'Total Applications', value: stats.totalApplications },
                  { label: 'Students Placed', value: stats.totalPlacements },
                ].map(({ label, value }) => (
                  <div key={label} style={styles.statCard}>
                    <div style={styles.statNumber}>{value}</div>
                    <div style={styles.statLabel}>{label}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'users' && (
              <>
                <h3>All Users ({users.length})</h3>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Email / Username</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Department</th>
                      <th style={styles.th}>CGPA</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr key={u.id} style={idx % 2 === 0 ? styles.evenRow : {}}>
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}><span style={{ ...styles.roleBadge, backgroundColor: u.role === 'admin' ? '#ffe0b2' : u.role === 'company' ? '#c8e6c9' : '#bbdefb' }}>{u.role}</span></td>
                        <td style={styles.td}>{u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '—'}</td>
                        <td style={styles.td}>{u.department || '—'}</td>
                        <td style={styles.td}>{u.cgpa ?? '—'}</td>
                        <td style={styles.td}>
                          {u.role !== 'admin' && (
                            <button style={styles.deleteBtn} onClick={() => handleDeleteUser(u.id, u.email)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === 'reports' && (
              <>
                <div style={styles.chartContainer}>
                  <h3>Department-wise Placement Percentage</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptReports}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis domain={[0, 100]} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="placementPercentage" fill="#8884d8" name="Placement %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <h3 style={{ marginTop: '24px' }}>Company-wise Applications</h3>
                {Object.keys(companyStats).length === 0 ? (
                  <p>No placement data available yet.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.theadRow}>
                        <th style={styles.th}>Company</th>
                        <th style={styles.th}>Total Applications Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(companyStats).map(([company, count], idx) => (
                        <tr key={company} style={idx % 2 === 0 ? styles.evenRow : {}}>
                          <td style={styles.td}>{company}</td>
                          <td style={styles.td}>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <h3 style={{ marginTop: '24px' }}>Student Application Summary</h3>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                       <th style={styles.th}>Name</th>
                       <th style={styles.th}>Department</th>
                       <th style={styles.th}>Applications Made</th>
                       <th style={styles.th}>Placement Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentReports.map((sr, idx) => (
                      <tr key={sr.studentId} style={idx % 2 === 0 ? styles.evenRow : {}}>
                         <td style={styles.td}>{sr.name || '—'}</td>
                         <td style={styles.td}>{sr.department || '—'}</td>
                         <td style={styles.td}>{sr.appsCount}</td>
                         <td style={styles.td}>
                           <span style={{color: sr.status === 'Placed' ? '#27ae60' : '#e74c3c', fontWeight: 'bold'}}>{sr.status}</span>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === 'feedback' && (
              <>
                <h3>Platform Feedback</h3>
                {feedbacks.length === 0 ? (
                  <p>No feedback submitted yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {feedbacks.map((fb) => (
                      <div key={fb.id} style={styles.feedbackCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '1.1rem' }}>{fb.userEmail} ({fb.userRole})</strong>
                          <span style={{ color: '#f39c12', fontWeight: 'bold' }}>⭐ {fb.rating}/5</span>
                        </div>
                        <div style={{ color: '#555', marginBottom: '8px', fontStyle: 'italic' }}>
                          "{fb.comments}"
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                          Submitted on {new Date(fb.submittedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px' },
  info: { background: '#d4edda', color: '#155724', padding: '10px 14px', borderRadius: '4px', marginBottom: '12px' },
  tabs: { display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px', marginTop: '16px' },
  statsGrid: { display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' },
  statCard: { background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '24px 32px', textAlign: 'center', minWidth: '150px' },
  statNumber: { fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e' },
  statLabel: { fontSize: '0.9rem', color: '#666', marginTop: '6px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '12px', background: '#fff' },
  theadRow: { backgroundColor: '#1a1a2e', color: '#fff' },
  th: { padding: '10px 14px', textAlign: 'left', fontWeight: 600 },
  td: { padding: '10px 14px', borderBottom: '1px solid #eee' },
  evenRow: { backgroundColor: '#f9f9f9' },
  roleBadge: { padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  deleteBtn: { padding: '5px 12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  chartContainer: { background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '16px' },
  feedbackCard: { background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
};

export default AdminDashboard;
