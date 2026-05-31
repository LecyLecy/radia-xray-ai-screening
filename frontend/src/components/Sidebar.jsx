import { NavLink } from 'react-router-dom';
import './components.css';

export const Sidebar = ({ role }) => {
  const isMedicalWorkspace = role === 'doctor' || role === 'admin';

  return (
    <aside className="radia-sidebar">
      <div className="sidebar-menu">
        {isMedicalWorkspace ? (
          <>
            <NavLink to="/doctor/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Dashboard Overview
            </NavLink>
            <NavLink to="/doctor/patients" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              Patient Registry
            </NavLink>
            {role === 'admin' && (
              <NavLink to="/admin/doctors" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                Medical Staff
              </NavLink>
            )}
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
