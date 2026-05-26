import { useState } from 'react';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import '../styles/patient.css';

export default function PatientDashboard() {
  const [profile, setProfile] = useState({
    name: 'Andi Wijaya',
    email: 'andi@mail.com',
    phone: '08123456789',
    dob: '1990-05-14',
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
  });

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setProfile({ ...profile, avatar: fileUrl });
    }
  };

  return (
    <div className="patient-panel">
      <div className="section-title">
        <h2>My Medical Profile</h2>
        <p>Manage your account settings and credentials</p>
      </div>

      <div className="grid-profile">
        <Card title="Profile Picture">
          <div className="avatar-upload-block">
            <img src={profile.avatar} alt="Avatar" className="profile-preview-img" />
            <div className="upload-action-box">
              <label className="file-upload-label">
                Upload New Image
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </label>
              <p className="upload-tip">Supports JPG or PNG. Max 2MB.</p>
            </div>
          </div>
        </Card>

        <Card title="Personal Information">
          <div className="form-info-grid">
            <FormInput label="Full Name" value={profile.name} disabled />
            <FormInput label="Email Address" value={profile.email} disabled />
            <FormInput label="Phone Number" value={profile.phone} disabled />
            <FormInput label="Date of Birth" value={profile.dob} disabled />
            <FormInput label="Gender" value={profile.gender} disabled />
          </div>
        </Card>
      </div>
    </div>
  );
}