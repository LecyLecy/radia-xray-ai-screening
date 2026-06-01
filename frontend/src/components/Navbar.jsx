import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';
import { getCurrentUserProfile } from '../services/userService';
import './components.css';

const roleLabel = {
  patient: 'Patient',
  doctor: 'Medical Staff',
  admin: 'Admin',
};

export const Navbar = ({ userRole, userName }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const currentProfile = await getCurrentUserProfile();
        if (isMounted) {
          setProfile(currentProfile);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [userRole, userName]);

  const displayName = profile?.full_name || userName || 'User';
  const displayEmail = profile?.email || userName || '-';
  const displayRole = profile?.role || userRole;
  const avatarInitial = useMemo(
    () => (displayName || displayEmail || 'R').trim().charAt(0).toUpperCase(),
    [displayEmail, displayName],
  );

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="radia-navbar">
      <div className="nav-brand">RADIA <span className="brand-sub">AI Screening</span></div>
      <div className="nav-profile">
        <button
          type="button"
          className="profile-menu-trigger"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Open profile menu"
        >
          {profile?.profile_picture_download_url ? (
            <img
              src={profile.profile_picture_download_url}
              alt=""
              className="profile-avatar-img"
            />
          ) : (
            <span className="profile-avatar-fallback">{avatarInitial}</span>
          )}
          <span className="profile-trigger-text">
            <strong>{displayName}</strong>
            <small>{roleLabel[displayRole] || displayRole}</small>
          </span>
        </button>

        {isMenuOpen && (
          <div className="profile-menu-panel">
            <div className="profile-menu-header">
              {profile?.profile_picture_download_url ? (
                <img
                  src={profile.profile_picture_download_url}
                  alt=""
                  className="profile-menu-avatar"
                />
              ) : (
                <span className="profile-menu-avatar profile-menu-avatar-default">
                  {avatarInitial}
                </span>
              )}
              <div>
                <strong>{displayName}</strong>
                <span>{displayEmail}</span>
                <small>{roleLabel[displayRole] || displayRole}</small>
              </div>
            </div>

            <div className="profile-menu-details">
              <span>Phone</span>
              <strong>{profile?.phone_number || '-'}</strong>
              <span>Age</span>
              <strong>{profile?.age ?? '-'}</strong>
              <span>Gender</span>
              <strong>{profile?.gender || '-'}</strong>
              {displayRole === 'doctor' && (
                <>
                  <span>Specialization</span>
                  <strong>{profile?.specialization || '-'}</strong>
                  <span>License Number</span>
                  <strong>{profile?.license_number || '-'}</strong>
                </>
              )}
            </div>

            <button type="button" onClick={handleLogout} className="profile-logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
