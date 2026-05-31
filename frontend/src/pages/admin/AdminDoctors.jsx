import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { Table } from '../../components/Table';
import {
  getDoctors,
  promotePatientToDoctor,
  searchPatientsByEmail,
} from '../../services/adminService';
import '../styles/doctor.css';

const emptyPromotionForm = {
  license_number: '',
  specialization: '',
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [promotionForm, setPromotionForm] = useState(emptyPromotionForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchDoctors = async () => {
    const doctorRows = await getDoctors();
    setDoctors(doctorRows);
  };

  useEffect(() => {
    let isMounted = true;

    const loadDoctors = async () => {
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

    loadDoctors();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSearchResults([]);
    setSelectedPatient(null);

    const emailQuery = searchEmail.trim();
    if (!emailQuery) {
      setErrorMessage('Enter a patient email to search.');
      return;
    }

    setIsSearching(true);
    try {
      const patients = await searchPatientsByEmail(emailQuery);
      setSearchResults(patients);
      if (patients.length === 0) {
        setErrorMessage('No patient account matched that email.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePromotionChange = (event) => {
    setPromotionForm({
      ...promotionForm,
      [event.target.name]: event.target.value,
    });
  };

  const handlePromote = async (event) => {
    event.preventDefault();
    if (!selectedPatient) {
      setErrorMessage('Select a patient before promoting.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const promotedDoctor = await promotePatientToDoctor({
        patient_id: selectedPatient.id,
        license_number: promotionForm.license_number.trim() || null,
        specialization: promotionForm.specialization.trim() || null,
      });

      await fetchDoctors();
      setSelectedPatient(null);
      setSearchResults([]);
      setPromotionForm(emptyPromotionForm);
      setSearchEmail(promotedDoctor.email);
      setSuccessMessage('Patient promoted to medical staff. Ask them to sign in again.');
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
        <p>Promote registered patient accounts into the clinical workspace</p>
      </div>

      <div className="doctor-workspace-grid">
        <Card title="Promote Patient To Medical Staff">
          <form onSubmit={handleSearch} className="admin-search-form">
            <FormInput
              label="Patient Email"
              name="email"
              type="email"
              value={searchEmail}
              onChange={(event) => setSearchEmail(event.target.value)}
              placeholder="patient@radia.com"
              required
            />
            <Button type="submit" variant="secondary" className="w-full" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search Patient'}
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="admin-result-list">
              {searchResults.map((patient) => (
                <button
                  type="button"
                  key={patient.id}
                  className={
                    selectedPatient?.id === patient.id
                      ? 'admin-patient-result selected'
                      : 'admin-patient-result'
                  }
                  onClick={() => setSelectedPatient(patient)}
                >
                  <span>
                    <strong>{patient.full_name}</strong>
                    <small>{patient.email}</small>
                  </span>
                  <span>{patient.phone_number || '-'}</span>
                </button>
              ))}
            </div>
          )}

          {selectedPatient && (
            <form onSubmit={handlePromote} className="promotion-form">
              <div className="selected-patient-card">
                <strong>{selectedPatient.full_name}</strong>
                <span>{selectedPatient.email}</span>
                <span>
                  {selectedPatient.phone_number || '-'} | {selectedPatient.age ?? '-'} |{' '}
                  {selectedPatient.gender || '-'}
                </span>
              </div>
              <FormInput
                label="License Number"
                name="license_number"
                value={promotionForm.license_number}
                onChange={handlePromotionChange}
                placeholder="DOC-001"
              />
              <FormInput
                label="Specialization"
                name="specialization"
                value={promotionForm.specialization}
                onChange={handlePromotionChange}
                placeholder="Radiology"
              />
              <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Promoting...' : 'Promote to Medical Staff'}
              </Button>
            </form>
          )}

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
