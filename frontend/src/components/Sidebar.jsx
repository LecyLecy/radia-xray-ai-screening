import { NavLink } from 'react-router-dom';
import './components.css';

export const Sidebar = ({ role }) => {
  return (
    <aside className="radia-sidebar">
      <div className="sidebar-menu">
        {role === 'doctor' ? (
          <>
            <NavLink to="/doctor/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Dashboard Overview
            </NavLink>
            <NavLink to="/doctor/patients" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Patient Registry
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/patient/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              My Profile
            </NavLink>
            <NavLink to="/patient/history" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Examination History
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
};