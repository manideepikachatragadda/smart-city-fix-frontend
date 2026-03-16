import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import ReportIssue from './pages/public/ReportIssue';
import ReportSuccess from './pages/public/ReportSuccess';
import TrackComplaint from './pages/public/TrackComplaint';
import SubmitFeedback from './pages/public/SubmitFeedback';
import LoginPage from './pages/public/LoginPage';

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard';
import WorkerDashboard from './pages/dashboard/WorkerDashboard';
import ComplaintQueue from './pages/dashboard/ComplaintQueue';
import ComplaintDetail from './pages/dashboard/ComplaintDetail';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="smartcity-theme">
      <Router>
        <Toaster position="top-right" />
        <Routes>

          {/* Public Routes - Wrapped in PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/success" element={<ReportSuccess />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/feedback/:id" element={<SubmitFeedback />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected Dashboard Routes - Wrapped in ProtectedRoute and DashboardLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>

              {/* Base Dashboard Route */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Role-Specific Examples */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                <Route path="/complaints" element={<ComplaintQueue />} />
                <Route path="/complaints/:id" element={<ComplaintDetail />} />
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/manager" element={<Dashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['worker']} />}>
                <Route path="/worker" element={<WorkerDashboard />} />
              </Route>

            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
