import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Patient Section Imports
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientHistory from '../pages/patient/PatientHistory';
import PatientExaminationDetail from '../pages/patient/PatientExaminationDetail';

// Doctor Section Imports
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import PatientList from '../pages/doctor/PatientList';
import DoctorPatientDetail from '../pages/doctor/DoctorPatientDetail';

const RoleRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('userRole');

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    const fallbackPath = role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Unauthenticated Fallbacks */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Combined Medical Portal Layout */}
      <Route element={<DashboardLayout />}>
        {/* Role: Patient Context Channels */}
        <Route path="/patient/dashboard" element={<RoleRoute allowedRoles={['patient']}><PatientDashboard /></RoleRoute>} />
        <Route path="/patient/history" element={<RoleRoute allowedRoles={['patient']}><PatientHistory /></RoleRoute>} />
        <Route path="/patient/examination/:id" element={<RoleRoute allowedRoles={['patient']}><PatientExaminationDetail /></RoleRoute>} />

        {/* Role: Medical Specialist Context Channels */}
        <Route path="/doctor/dashboard" element={<RoleRoute allowedRoles={['doctor', 'admin']}><DoctorDashboard /></RoleRoute>} />
        <Route path="/doctor/patients" element={<RoleRoute allowedRoles={['doctor', 'admin']}><PatientList /></RoleRoute>} />
        <Route path="/doctor/patient/:id" element={<RoleRoute allowedRoles={['doctor', 'admin']}><DoctorPatientDetail /></RoleRoute>} />
      </Route>

      {/* Wildcard Guard Catching Unmapped Trailing Routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
