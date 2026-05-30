import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import './layout.css';

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (!role || !userId) {
      navigate('/login');
    }
  }, [role, userId, navigate]);

  if (!role) return null;

  return (
    <div className="dashboard-structure">
      <Navbar userRole={role} userName={userEmail || "User"} />
      <div className="dashboard-viewport">
        <Sidebar role={role} />
        <main className="dashboard-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
