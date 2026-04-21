import { useState } from 'react';
import Navbar from '../Navbar';
import API from '../../api/axios';

const FeedbackForm = () => {
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await API.post('/feedback', { rating, comments });
      setMessage('Thank you! Your feedback has been submitted successfully.');
      setComments('');
      setRating(5);
    } catch {
      setMessage('Failed to submit feedback. Please try again later.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2>Submit Feedback</h2>
        <p>Your feedback helps us improve the Career Development and Placement Management System.</p>

        {message && <div style={message.includes('success') ? styles.success : styles.error}>{message}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Rate your experience (1-5)</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={styles.input}>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Average</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Terrible</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Comments & Suggestions</label>
            <textarea
              required
              rows={5}
              style={styles.textarea}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us what you like or what we can improve..."
            />
          </div>
          <button type="submit" style={styles.btn}>Submit Feedback</button>
        </form>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '30px', maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '40px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontWeight: 600, color: '#333' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' },
  textarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', resize: 'vertical' as const },
  btn: { padding: '12px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' },
  success: { background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '4px' },
  error: { background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px' },
};

export default FeedbackForm;
