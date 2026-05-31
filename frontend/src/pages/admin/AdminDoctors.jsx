import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { Table } from '../../components/Table';
import { createDoctor, getDoctors } from '../../services/adminService';
import '../styles/doctor.css';

const emptyForm = {
  full_name: '',
  email: '',
  password: '',
  phone_number: '',
  age: '',
  gender: '',
  license_number: '',
  specialization: '',
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchDoctors = async () => {
      try {
        const doctorRows = await getDoctors();
        if (isMounted) {
          setDoctors(doctorRows);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDoctors();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const createdDoctor = await createDoctor({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone_number: formData.phone_number.trim() || null,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender || null,
        license_number: formData.license_number.trim() || null,
        specialization: formData.specialization.trim() || null,
      });

      setDoctors((currentDoctors) => [createdDoctor, ...currentDoctors]);
      setFormData(emptyForm);
      setSuccessMessage('Medical staff account created successfully.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="doctor-panel">
      <div className="section-title">
        <h2>Medical Staff Management</h2>
        <p>Create and review doctor accounts for the clinical workflow</p>
      </div>

      <div className="doctor-workspace-grid">
        <Card title="Create Medical Staff Account">
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Doctor full name"
              required
            />
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="doctor@radia.com"
              required
            />
            <FormInput
              label="Temporary Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Set initial password"
              required
            />
            <FormInput
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="08123456789"
            />
            <FormInput
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="35"
            />
            <div className="radia-form-group">
              <label className="radia-label">Gender</label>
              <select
                className="radia-input"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Not set</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <FormInput
              label="License Number"
              name="license_number"
              value={formData.license_number}
              onChange={handleInputChange}
              placeholder="DOC-001"
            />
            <FormInput
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              placeholder="Radiology"
            />
            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Medical Staff'}
            </Button>
          </form>
          {successMessage && <p className="success-text">{successMessage}</p>}
          {errorMessage && <p className="error-text">{errorMessage}</p>}
        </Card>

        <Card title="Registered Medical Staff">
          {isLoading && <p className="empty-text">Loading medical staff...</p>}
          {!isLoading && doctors.length === 0 && (
            <p className="empty-text">No medical staff accounts are available yet.</p>
          )}
          {!isLoading && doctors.length > 0 && (
            <Table headers={['Name', 'Email', 'Specialization', 'License']}>
              {doctors.map((doctor) => (
                <tr key={doctor.id || doctor.user_id}>
                  <td><strong>{doctor.full_name}</strong></td>
                  <td>{doctor.email}</td>
                  <td>{doctor.specialization || '-'}</td>
                  <td>{doctor.license_number || '-'}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
