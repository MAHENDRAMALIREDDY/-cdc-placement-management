import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student
import StudentDashboard from './Components/Student/StudentDashboard';
import JobList from './Components/Student/JobList';
import MyApplications from './Components/Student/MyApplications';
import StudentProfile from './Components/Student/StudentProfile';

// Company
import CompanyDashboard from './Components/Company/CompanyDashboard';
import PostJob from './Components/Company/PostJob';
import CompanyApplications from './Components/Company/CompanyApplications';

// Admin
import AdminDashboard from './Components/Admin/AdminDashboard';

// Shared
import FeedbackForm from './Components/Shared/FeedbackForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/jobs"
            element={
              <ProtectedRoute allowedRole="student">
                <JobList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications"
            element={
              <ProtectedRoute allowedRole="student">
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          {/* Company Routes */}
          <Route
            path="/company"
            element={
              <ProtectedRoute allowedRole="company">
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/post-job"
            element={
              <ProtectedRoute allowedRole="company">
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/applications"
            element={
              <ProtectedRoute allowedRole="company">
                <CompanyApplications />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes */}
          <Route
            path="/feedback"
            element={
              <ProtectedRoute allowedRole="shared">
                <FeedbackForm />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
