import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';
import './components.css';

export const Navbar = ({ userRole, userName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="radia-navbar">
      <div className="nav-brand">RADIA <span className="brand-sub">AI Screening</span></div>
      <div className="nav-profile">
        <span className="user-info"><strong>{userName}</strong> ({userRole})</span>
        <button onClick={handleLogout} className="logout-trigger">Logout</button>
      </div>
    </nav>
  );
};
