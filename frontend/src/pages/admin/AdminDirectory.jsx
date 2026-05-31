import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { Table } from '../../components/Table';
import {
  createDoctor,
  createPatient,
  deleteDoctor,
  deletePatient,
  getDoctors,
  getPatients,
  updateDoctor,
  updatePatient,
} from '../../services/adminService';
import '../styles/doctor.css';

const emptyForm = {
  email: '',
  password: '',
  full_name: '',
  phone_number: '',
  age: '',
  gender: '',
  license_number: '',
  specialization: '',
};

const toFormData = (user) => ({
  email: user.email || '',
  password: '',
  full_name: user.full_name || '',
  phone_number: user.phone_number || '',
  age: user.age ?? '',
  gender: user.gender || '',
  license_number: user.license_number || '',
  specialization: user.specialization || '',
});

const toProfilePayload = (form) => ({
  full_name: form.full_name.trim(),
  phone_number: form.phone_number.trim() || null,
  age: form.age === '' ? null : Number(form.age),
  gender: form.gender || null,
});

export default function AdminDirectory() {
  const [activeTable, setActiveTable] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isDoctorTable = activeTable === 'doctors';
  const isEditing = Boolean(editingUser);

  const loadDirectory = async () => {
    try {
      setIsLoading(true);
      const [doctorRows, patientRows] = await Promise.all([
        getDoctors(),
        getPatients(),
      ]);
      setDoctors(doctorRows);
      setPatients(patientRows);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialDirectory = async () => {
      try {
        const [doctorRows, patientRows] = await Promise.all([
          getDoctors(),
          getPatients(),
        ]);

        if (!ignore) {
          setDoctors(doctorRows);
          setPatients(patientRows);
        }
      } catch (error) {
        if (!ignore) setErrorMessage(error.message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadInitialDirectory();

    return () => {
      ignore = true;
    };
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingUser(null);
  };

  const switchTable = (tableName) => {
    setActiveTable(tableName);
    setErrorMessage('');
    setSuccessMessage('');
    resetForm();
  };

  const handleFormChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData(toFormData(user));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const buildPayload = () => {
    const payload = toProfilePayload(formData);
    if (!isEditing) {
      payload.email = formData.email.trim();
      payload.password = formData.password;
    }
    if (isDoctorTable) {
      payload.license_number = formData.license_number.trim() || null;
      payload.specialization = formData.specialization.trim() || null;
    }
    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      if (isDoctorTable && isEditing) {
        await updateDoctor(editingUser.id, payload);
      } else if (isDoctorTable) {
        await createDoctor(payload);
      } else if (isEditing) {
        await updatePatient(editingUser.id, payload);
      } else {
        await createPatient(payload);
      }

      resetForm();
      await loadDirectory();
      setSuccessMessage(
        `${isDoctorTable ? 'Medical staff' : 'Patient'} ${isEditing ? 'updated' : 'created'}.`,
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    const label = isDoctorTable ? 'medical staff' : 'patient';
    const confirmed = window.confirm(`Delete ${label} account for ${user.full_name}?`);
    if (!confirmed) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isDoctorTable) {
        await deleteDoctor(user.id);
      } else {
        await deletePatient(user.id);
      }
      if (editingUser?.id === user.id) resetForm();
      await loadDirectory();
      setSuccessMessage(`${isDoctorTable ? 'Medical staff' : 'Patient'} deleted.`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="doctor-panel">
      <div className="header-action-row">
        <div className="section-title">
          <h2>Users Directory</h2>
          <p>Create, update, and manage registered medical staff and patient accounts.</p>
        </div>
        <div className="segmented-actions">
          <Button
            variant={isDoctorTable ? 'primary' : 'secondary'}
            onClick={() => switchTable('doctors')}
          >
            Medical Staff
          </Button>
          <Button
            variant={!isDoctorTable ? 'primary' : 'secondary'}
            onClick={() => switchTable('patients')}
          >
            Patients
          </Button>
        </div>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}

      <Card title={`${isEditing ? 'Edit' : 'Create'} ${isDoctorTable ? 'Medical Staff' : 'Patient'}`}>
        <form onSubmit={handleSubmit} className="admin-crud-form">
          {!isEditing && (
            <>
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder={isDoctorTable ? 'doctor@radia.com' : 'patient@radia.com'}
                required
              />
              <FormInput
                label="Temporary Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                placeholder="Minimum 6 characters"
                required
              />
            </>
          )}
          <FormInput
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleFormChange}
            placeholder="Full name"
            required
          />
          <FormInput
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleFormChange}
            placeholder="+62..."
          />
          <FormInput
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleFormChange}
            placeholder="30"
          />
          <div className="radia-form-group">
            <label className="radia-label" htmlFor="admin-gender">Gender</label>
            <select
              id="admin-gender"
              name="gender"
              value={formData.gender}
              onChange={handleFormChange}
              className="radia-input"
            >
              <option value="">Not set</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          {isDoctorTable && (
            <>
              <FormInput
                label="License Number"
                name="license_number"
                value={formData.license_number}
                onChange={handleFormChange}
                placeholder="DOC-001"
              />
              <FormInput
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleFormChange}
                placeholder="Radiology"
              />
            </>
          )}
          <div className="admin-crud-actions">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Account'}
            </Button>
            {isEditing && (
              <Button type="button" variant="secondary" onClick={resetForm} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card title={isDoctorTable ? 'Registered Medical Staff' : 'Registered Patients'}>
        {isLoading && <p className="empty-text">Loading users...</p>}

        {!isLoading && isDoctorTable && doctors.length === 0 && (
          <p className="empty-text">No medical staff accounts are available yet.</p>
        )}
        {!isLoading && isDoctorTable && doctors.length > 0 && (
          <Table headers={['Name', 'Email', 'Specialization', 'License', 'Actions']}>
            {doctors.map((doctor) => (
              <tr key={doctor.id || doctor.user_id}>
                <td><strong>{doctor.full_name}</strong></td>
                <td>{doctor.email}</td>
                <td>{doctor.specialization || '-'}</td>
                <td>{doctor.license_number || '-'}</td>
                <td>
                  <div className="table-actions">
                    <Button variant="secondary" onClick={() => handleEdit(doctor)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDelete(doctor)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {!isLoading && !isDoctorTable && patients.length === 0 && (
          <p className="empty-text">No patient accounts are available yet.</p>
        )}
        {!isLoading && !isDoctorTable && patients.length > 0 && (
          <Table headers={['Full Name', 'Email', 'Contact', 'Age', 'Gender', 'Actions']}>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td><strong>{patient.full_name}</strong></td>
                <td>{patient.email}</td>
                <td>{patient.phone_number || '-'}</td>
                <td>{patient.age ?? '-'}</td>
                <td>{patient.gender || '-'}</td>
                <td>
                  <div className="table-actions">
                    <Button variant="secondary" onClick={() => handleEdit(patient)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDelete(patient)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
