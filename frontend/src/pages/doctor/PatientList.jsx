import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { getAllPatients, searchDoctorPatientsByEmail } from '../../services/examinationService';

export default function PatientList() {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const isAdmin = role === 'admin';
  const [patients, setPatients] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setNoticeMessage('');
      setPatients(await getAllPatients());
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPatients = async () => {
      try {
        setIsLoading(true);
        setNoticeMessage('');
        const patientRows = await getAllPatients();
        if (isMounted) {
          setPatients(patientRows);
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

    loadPatients();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setNoticeMessage('');

    const emailQuery = searchEmail.trim();
    if (!emailQuery) {
      await fetchPatients();
      return;
    }

    setIsSearching(true);
    try {
      const patientRows = await searchDoctorPatientsByEmail(emailQuery);
      setPatients(patientRows);
      if (patientRows.length === 0) {
        setNoticeMessage('No registered patient matched that email. Ask the patient to register first.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchEmail('');
    setErrorMessage('');
    setNoticeMessage('');
    await fetchPatients();
  };

  return (
    <div className="doctor-panel">
      <div className="section-title">
        <h2>{isAdmin ? 'All Patients' : 'Patient Registry'}</h2>
        <p>
          {isAdmin
            ? 'View every registered patient account in the system'
            : 'Search a registered patient or start a scan from the doctor workspace'}
        </p>
      </div>

      <form className="patient-search-bar" onSubmit={handleSearch}>
        <input
          className="radia-input"
          type="email"
          value={searchEmail}
          onChange={(event) => setSearchEmail(event.target.value)}
          placeholder="Search registered patient by email"
        />
        <Button type="submit" variant="primary" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleClearSearch}>
          Clear
        </Button>
      </form>

      {isLoading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading patients...</div>}
      {errorMessage && <div style={{ padding: '1rem', color: '#dc2626' }}>{errorMessage}</div>}
      {noticeMessage && <p className="empty-text">{noticeMessage}</p>}

      {!isLoading && !errorMessage && (
        patients.length > 0 ? (
          <Table headers={isAdmin ? ['Patient ID', 'Full Name', 'Email', 'Contact', 'Age', 'Gender'] : ['Patient ID', 'Full Name', 'Email', 'Contact', 'Age', 'Gender', 'Action']}>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td><strong>{patient.id}</strong></td>
                <td>{patient.full_name}</td>
                <td>{patient.email}</td>
                <td>{patient.phone_number || '-'}</td>
                <td>{patient.age ?? '-'}</td>
                <td>{patient.gender || '-'}</td>
                {!isAdmin && (
                  <td>
                    <Button variant="primary" onClick={() => navigate(`/doctor/patient/${patient.id}`)}>
                      Start Scan
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </Table>
        ) : (
          <p className="empty-text">No patient profiles are available yet.</p>
        )
      )}
    </div>
  );
}
