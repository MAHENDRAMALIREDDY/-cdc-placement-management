import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<'student' | 'company'>('student');
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address (e.g. user@example.com).');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const pwErrors: string[] = [];
    if (form.password.length < 8)        pwErrors.push('at least 8 characters');
    if (!/[A-Z]/.test(form.password))    pwErrors.push('1 uppercase letter');
    if (!/[0-9]/.test(form.password))    pwErrors.push('1 number');
    if (!/[^A-Za-z0-9]/.test(form.password)) pwErrors.push('1 symbol (e.g. @, #, !)');
    if (pwErrors.length > 0) {
      setError(`Password must contain: ${pwErrors.join(', ')}.`);
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        email: form.email,
        password: form.password,
        role,
      };
      if (role === 'student') {
        payload.firstName = form.firstName;
        payload.lastName = form.lastName;
        payload.department = form.department;
      }

      const res = await API.post('/register', payload);
      const { token, role: returnedRole } = res.data;
      login(token, returnedRole);

      if (returnedRole === 'student') navigate('/student');
      else navigate('/company');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Career Development & Placement Management System</p>

        {/* Role Toggle */}
        <div style={styles.roleRow}>
          <button
            type="button"
            style={{ ...styles.roleBtn, ...(role === 'student' ? styles.roleBtnActive : {}) }}
            onClick={() => setRole('student')}
          >
            🎓 Student
          </button>
          <button
            type="button"
            style={{ ...styles.roleBtn, ...(role === 'company' ? styles.roleBtnActive : {}) }}
            onClick={() => setRole('company')}
          >
            🏢 Company
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Student-only fields */}
          {role === 'student' && (
            <>
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Smith" style={styles.input} />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Computer Science and Engineering" style={styles.input} />
              </div>
            </>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>{role === 'company' ? 'Company Email *' : 'Email / Username *'}</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder={role === 'company' ? 'hr@company.com' : 'your.email@university.edu'}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 8 chars, uppercase, number &amp; symbol"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating Account...' : `Register as ${role === 'student' ? 'Student' : 'Company'}`}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1a1a2e', fontWeight: 600 }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '24px',
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '420px',
    maxWidth: '100%',
  },
  title: { margin: '0 0 4px', fontSize: '1.5rem', color: '#1a1a2e' },
  subtitle: { margin: '0 0 20px', fontSize: '0.85rem', color: '#666' },
  roleRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  roleBtn: {
    flex: 1,
    padding: '10px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.95rem',
    color: '#555',
    transition: 'all 0.15s',
  },
  roleBtnActive: {
    borderColor: '#1a1a2e',
    backgroundColor: '#1a1a2e',
    color: '#fff',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row: { display: 'flex', gap: '12px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  label: { fontSize: '0.9rem', fontWeight: 500, color: '#333' },
  input: { padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', outline: 'none' },
  btn: {
    padding: '11px',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '6px',
    fontWeight: 600,
  },
  error: {
    backgroundColor: '#ffe0e0',
    color: '#c0392b',
    padding: '10px 12px',
    borderRadius: '4px',
    marginBottom: '8px',
    fontSize: '0.9rem',
  },
  loginLink: { textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#555' },
};

export default RegisterPage;
