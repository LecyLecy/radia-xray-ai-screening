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

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Unauthenticated Fallbacks */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Combined Medical Portal Layout */}
      <Route element={<DashboardLayout />}>
        {/* Role: Patient Context Channels */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/history" element={<PatientHistory />} />
        <Route path="/patient/examination/:id" element={<PatientExaminationDetail />} />

        {/* Role: Medical Specialist Context Channels */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<PatientList />} />
        <Route path="/doctor/patient/:id" element={<DoctorPatientDetail />} />
      </Route>

      {/* Wildcard Guard Catching Unmapped Trailing Routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};