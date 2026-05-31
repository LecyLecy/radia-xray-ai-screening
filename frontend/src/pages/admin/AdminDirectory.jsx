import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { getDoctors } from '../../services/adminService';
import { getAllPatients } from '../../services/examinationService';
import '../styles/doctor.css';

export default function AdminDirectory() {
  const [activeTable, setActiveTable] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadDirectory = async () => {
      try {
        setIsLoading(true);
        const [doctorRows, patientRows] = await Promise.all([
          getDoctors(),
          getAllPatients(),
        ]);
        setDoctors(doctorRows);
        setPatients(patientRows);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDirectory();
  }, []);

  const isDoctorTable = activeTable === 'doctors';

  return (
    <div className="doctor-panel">
      <div className="header-action-row">
        <div className="section-title">
          <h2>Users Directory</h2>
          <p>Switch between registered medical staff and patient accounts.</p>
        </div>
        <div className="segmented-actions">
          <Button
            variant={isDoctorTable ? 'primary' : 'secondary'}
            onClick={() => setActiveTable('doctors')}
          >
            Medical Staff
          </Button>
          <Button
            variant={!isDoctorTable ? 'primary' : 'secondary'}
            onClick={() => setActiveTable('patients')}
          >
            Patients
          </Button>
        </div>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <Card title={isDoctorTable ? 'Registered Medical Staff' : 'Registered Patients'}>
        {isLoading && <p className="empty-text">Loading users...</p>}

        {!isLoading && isDoctorTable && doctors.length === 0 && (
          <p className="empty-text">No medical staff accounts are available yet.</p>
        )}
        {!isLoading && isDoctorTable && doctors.length > 0 && (
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

        {!isLoading && !isDoctorTable && patients.length === 0 && (
          <p className="empty-text">No patient accounts are available yet.</p>
        )}
        {!isLoading && !isDoctorTable && patients.length > 0 && (
          <Table headers={['Patient ID', 'Full Name', 'Email', 'Contact', 'Age', 'Gender']}>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td><strong>{patient.id}</strong></td>
                <td>{patient.full_name}</td>
                <td>{patient.email}</td>
                <td>{patient.phone_number || '-'}</td>
                <td>{patient.age ?? '-'}</td>
                <td>{patient.gender || '-'}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
