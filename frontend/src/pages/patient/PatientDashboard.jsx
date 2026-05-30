import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { StatusBadge } from '../../components/StatusBadge';
import { getCurrentPatientProfile } from '../../services/authService';
import { getMyExaminations } from '../../services/examinationService';
import '../styles/patient.css';

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [examinations, setExaminations] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [profileData, examinationRows] = await Promise.all([
          getCurrentPatientProfile(),
          getMyExaminations(),
        ]);

        setProfile(profileData);
        setExaminations(examinationRows);
        setAvatarPreview(profileData.profile_picture_url || '');
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setAvatarPreview(fileUrl);
    }
  };

  const latestExamination = examinations[0];

  if (isLoading) {
    return <div className="patient-panel"><p className="empty-text">Loading patient profile...</p></div>;
  }

  if (!profile) {
    return <div className="patient-panel"><p className="error-text">{errorMessage || 'Patient profile could not be loaded.'}</p></div>;
  }

  return (
    <div className="patient-panel">
      <div className="section-title">
        <h2>My Medical Profile</h2>
        <p>Manage your account settings and credentials</p>
      </div>

      <div className="grid-profile">
        <Card title="Profile Picture">
          <div className="avatar-upload-block">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="profile-preview-img" />
            ) : (
              <div className="profile-preview-placeholder">
                {profile.full_name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
            )}
            <div className="upload-action-box">
              <label className="file-upload-label">
                Preview New Image
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </label>
              <p className="upload-tip">Preview only. Upload persistence is future work.</p>
            </div>
          </div>
        </Card>

        <Card title="Personal Information">
          <div className="form-info-grid">
            <FormInput label="Full Name" value={profile.full_name || ''} disabled />
            <FormInput label="Email Address" value={profile.email || ''} disabled />
            <FormInput label="Phone Number" value={profile.phone_number || ''} disabled />
            <FormInput label="Age" value={profile.age ?? ''} disabled />
            <FormInput label="Gender" value={profile.gender || ''} disabled />
          </div>
        </Card>

        <Card title="Latest Examination">
          {latestExamination ? (
            <div className="latest-exam-card">
              <div className="meta-item">
                <span className="label">Status</span>
                <span className="val"><StatusBadge status={latestExamination.status} /></span>
              </div>
              <div className="meta-item">
                <span className="label">AI Result</span>
                <span className="val">{latestExamination.prediction_result || '-'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Report</span>
                <span className="val">{latestExamination.report_id ? 'Available' : 'Not ready'}</span>
              </div>
            </div>
          ) : (
            <p className="empty-text">No examination history yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
