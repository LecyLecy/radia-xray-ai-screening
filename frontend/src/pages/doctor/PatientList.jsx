import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { getAllPatients } from '../../services/examinationService';

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        setPatients(await getAllPatients());
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="doctor-panel">
      <div className="section-title">
        <h2>Patient Registry</h2>
        <p>Select a patient to evaluate history or trigger fresh diagnostics</p>
      </div>

      {isLoading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading patients...</div>}
      {errorMessage && <div style={{ padding: '1rem', color: '#dc2626' }}>{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        <Table headers={['Patient ID', 'Full Name', 'Contact', 'Age', 'Gender', 'Action']}>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td><strong>{patient.id}</strong></td>
              <td>{patient.full_name}</td>
              <td>{patient.phone_number || '-'}</td>
              <td>{patient.age ?? '-'}</td>
              <td>{patient.gender || '-'}</td>
              <td>
                <Button variant="primary" onClick={() => navigate(`/doctor/patient/${patient.id}`)}>
                  Open Medical File
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
