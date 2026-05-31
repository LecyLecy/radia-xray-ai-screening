import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Patient Section Imports
import PatientHistory from '../pages/patient/PatientHistory';
import PatientExaminationDetail from '../pages/patient/PatientExaminationDetail';

// Doctor Section Imports
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import PatientList from '../pages/doctor/PatientList';
import DoctorPatientDetail from '../pages/doctor/DoctorPatientDetail';
import StartNewScan from '../pages/doctor/StartNewScan';
import DoctorExaminations from '../pages/doctor/DoctorExaminations';
import DoctorExaminationDetail from '../pages/doctor/DoctorExaminationDetail';
import AdminDirectory from '../pages/admin/AdminDirectory';
import AdminAddMedicalStaff from '../pages/admin/AdminAddMedicalStaff';

const RoleRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('userRole');

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    const fallbackPath = role === 'patient' ? '/patient/history' : '/doctor/dashboard';
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
        <Route path="/patient/dashboard" element={<RoleRoute allowedRoles={['patient']}><Navigate to="/patient/history" replace /></RoleRoute>} />
        <Route path="/patient/history" element={<RoleRoute allowedRoles={['patient']}><PatientHistory /></RoleRoute>} />
        <Route path="/patient/examination/:id" element={<RoleRoute allowedRoles={['patient']}><PatientExaminationDetail /></RoleRoute>} />

        {/* Role: Medical Specialist Context Channels */}
        <Route path="/doctor/dashboard" element={<RoleRoute allowedRoles={['doctor', 'admin']}><DoctorDashboard /></RoleRoute>} />
        <Route path="/doctor/start-scan" element={<RoleRoute allowedRoles={['doctor']}><StartNewScan /></RoleRoute>} />
        <Route path="/doctor/examinations" element={<RoleRoute allowedRoles={['doctor']}><DoctorExaminations /></RoleRoute>} />
        <Route path="/doctor/examinations/:id" element={<RoleRoute allowedRoles={['doctor']}><DoctorExaminationDetail /></RoleRoute>} />
        <Route path="/doctor/patients" element={<RoleRoute allowedRoles={['doctor']}><PatientList /></RoleRoute>} />
        <Route path="/doctor/patient/:id" element={<RoleRoute allowedRoles={['doctor']}><DoctorPatientDetail /></RoleRoute>} />
        <Route path="/admin/patients" element={<RoleRoute allowedRoles={['admin']}><AdminDirectory /></RoleRoute>} />
        <Route path="/admin/doctors" element={<RoleRoute allowedRoles={['admin']}><AdminDirectory /></RoleRoute>} />
        <Route path="/admin/directory" element={<RoleRoute allowedRoles={['admin']}><AdminDirectory /></RoleRoute>} />
        <Route path="/admin/add-medical-staff" element={<RoleRoute allowedRoles={['admin']}><AdminAddMedicalStaff /></RoleRoute>} />
      </Route>

      {/* Wildcard Guard Catching Unmapped Trailing Routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
