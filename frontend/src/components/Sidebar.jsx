import { NavLink } from 'react-router-dom';
import './components.css';

export const Sidebar = ({ role }) => {
  return (
    <aside className="radia-sidebar">
      <div className="sidebar-menu">
        {role === 'admin' ? (
          <>
            <NavLink to="/doctor/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Dashboard Overview
            </NavLink>
            <NavLink to="/admin/directory" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Users Directory
            </NavLink>
            <NavLink to="/admin/add-medical-staff" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Add Medical Staff
            </NavLink>
          </>
        ) : role === 'doctor' ? (
          <>
            <NavLink to="/doctor/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Dashboard Overview
            </NavLink>
            <NavLink to="/doctor/start-scan" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Start New Scan
            </NavLink>
            <NavLink to="/doctor/examinations" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              My Examinations
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/patient/history" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Examination History
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
};
