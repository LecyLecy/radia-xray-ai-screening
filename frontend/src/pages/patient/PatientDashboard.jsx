import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import {
  getCurrentPatientProfile,
  updateCurrentPatientProfile,
  uploadCurrentPatientProfilePicture,
} from '../../services/authService';
import { getMyExaminations } from '../../services/examinationService';
import '../styles/patient.css';

const emptyProfileForm = {
  full_name: '',
  phone_number: '',
  age: '',
  gender: '',
};

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [examinations, setExaminations] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [profileData, examinationRows] = await Promise.all([
          getCurrentPatientProfile(),
          getMyExaminations(),
        ]);

        setProfile(profileData);
        setProfileForm({
          full_name: profileData.full_name || '',
          phone_number: profileData.phone_number || '',
          age: profileData.age ?? '',
          gender: profileData.gender || '',
        });
        setExaminations(examinationRows);
        setAvatarPreview(profileData.profile_picture_download_url || '');
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!profileForm.full_name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSavingProfile(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedProfile = await updateCurrentPatientProfile({
        full_name: profileForm.full_name.trim(),
        phone_number: profileForm.phone_number.trim() || null,
        age: profileForm.age === '' ? null : Number(profileForm.age),
        gender: profileForm.gender || null,
      });

      setProfile(updatedProfile);
      setProfileForm({
        full_name: updatedProfile.full_name || '',
        phone_number: updatedProfile.phone_number || '',
        age: updatedProfile.age ?? '',
        gender: updatedProfile.gender || '',
      });
      setAvatarPreview(updatedProfile.profile_picture_download_url || avatarPreview);
      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Profile photo only supports JPG, PNG, and WEBP.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Profile photo must be 2 MB or smaller.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setIsUploadingPicture(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedProfile = await uploadCurrentPatientProfilePicture(file);
      setProfile(updatedProfile);
      setAvatarPreview(updatedProfile.profile_picture_download_url || previewUrl);
      setSuccessMessage('Profile photo uploaded successfully.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploadingPicture(false);
      event.target.value = '';
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
        <p>Manage your account settings and identity details</p>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}

      <div className="grid-profile">
        <Card title="Profile Photo">
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
                {isUploadingPicture ? 'Uploading...' : 'Upload New Image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  disabled={isUploadingPicture}
                />
              </label>
              <p className="upload-tip">Supports JPG, PNG, or WEBP. Maximum 2 MB.</p>
            </div>
          </div>
        </Card>

        <Card title="Personal Information">
          <div className="form-info-grid">
            <FormInput
              label="Full Name"
              name="full_name"
              value={profileForm.full_name}
              onChange={handleProfileInputChange}
              required
            />
            <FormInput label="Email Address" value={profile.email || ''} disabled />
            <FormInput
              label="Phone Number"
              name="phone_number"
              value={profileForm.phone_number}
              onChange={handleProfileInputChange}
              placeholder="08123456789"
            />
            <FormInput
              label="Age"
              type="number"
              name="age"
              value={profileForm.age}
              onChange={handleProfileInputChange}
              placeholder="30"
            />
            <div className="radia-form-group">
              <label className="radia-label">Gender</label>
              <select
                className="radia-input"
                name="gender"
                value={profileForm.gender}
                onChange={handleProfileInputChange}
              >
                <option value="">Not set</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="profile-actions">
            <Button
              variant="primary"
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? 'Saving Profile...' : 'Save Profile'}
            </Button>
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
                <span className="label">Final Diagnosis</span>
                <span className="val">{latestExamination.final_diagnosis_result || '-'}</span>
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
