import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { role, displayName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    if (role === 'student') {
      return (
        <>
          <Link to="/student">Dashboard</Link>
          <Link to="/student/profile">My Profile</Link>
          <Link to="/student/jobs">Jobs</Link>
          <Link to="/student/applications">My Applications</Link>
          <Link to="/feedback">Feedback</Link>
        </>
      );
    }
    if (role === 'company') {
      return (
        <>
          <Link to="/company">Dashboard</Link>
          <Link to="/company/post-job">Post Job</Link>
          <Link to="/company/applications">Applications</Link>
          <Link to="/feedback">Feedback</Link>
        </>
      );
    }
    if (role === 'admin') {
      return (
        <>
          <Link to="/admin">Dashboard</Link>
        </>
      );
    }
    return null;
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>CDPMS</div>
      <div style={styles.links}>{getLinks()}</div>
      <div style={styles.right}>
          {role && (
            <div style={styles.userInfo}>
              <span style={styles.userName}>{displayName || 'Loading...'}</span>
              <span style={{
                ...styles.roleBadge,
                backgroundColor: role === 'admin' ? '#e67e22' : role === 'company' ? '#27ae60' : '#2980b9',
              }}>
                {role}
              </span>
            </div>
          )}
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#1a1a2e',
    color: '#fff',
  },
  brand: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#e94560',
  },
  links: {
    display: 'flex',
    gap: '16px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  role: {
    fontSize: '0.85rem',
    color: '#aaa',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  userName: {
    fontSize: '0.9rem',
    color: '#fff',
    fontWeight: 500,
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  roleBadge: {
    fontSize: '0.7rem',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    padding: '6px 14px',
    backgroundColor: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

// Inject global link styles once
const globalStyle = document.createElement('style');
globalStyle.innerHTML = `nav a { color: #ccc; text-decoration: none; } nav a:hover { color: #fff; }`;
document.head.appendChild(globalStyle);

export default Navbar;
