import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { Table } from '../../components/Table';
import {
  deleteDoctorExamination,
  getDoctorExaminations,
} from '../../services/examinationService';
import '../styles/doctor.css';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

export default function DoctorExaminations() {
  const navigate = useNavigate();
  const [examinations, setExaminations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchExaminations = async () => {
      try {
        setIsLoading(true);
        setExaminations(await getDoctorExaminations());
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExaminations();
  }, []);

  const handleDelete = async (exam) => {
    const confirmed = window.confirm(
      `Delete examination for ${exam.patient_name || exam.patient_email || exam.patient_id}?`,
    );
    if (!confirmed) return;

    try {
      setErrorMessage('');
      await deleteDoctorExamination(exam.id);
      localStorage.removeItem(`doctor_scan_assessment_${exam.id}`);
      setExaminations((current) => current.filter((item) => item.id !== exam.id));
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="doctor-panel">
      <div className="header-action-row">
        <div className="section-title">
          <h2>My Examinations</h2>
          <p>Review scans that enter your doctor queue.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/doctor/start-scan')}>
          Start New Scan
        </Button>
      </div>

      {isLoading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading examinations...</div>}
      {errorMessage && <div style={{ padding: '1rem', color: '#dc2626' }}>{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        examinations.length > 0 ? (
          <Table headers={['Patient', 'Email', 'Date', 'Status', 'AI Result', 'Confidence', 'Action']}>
            {examinations.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.patient_name || exam.patient_id}</td>
                <td>{exam.patient_email || '-'}</td>
                <td>{formatDate(exam.examination_date)}</td>
                <td><StatusBadge status={exam.status} /></td>
                <td>
                  {exam.prediction_result ? (
                    <span className={`prediction-text ${exam.prediction_result.toLowerCase()}`}>
                      {exam.prediction_result}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>{exam.confidence_percentage ?? '-'}%</td>
                <td>
                  <div className="table-actions">
                    <Button variant="secondary" onClick={() => navigate(`/doctor/examinations/${exam.id}`)}>
                      {exam.status === 'ready' ? 'Open' : 'Review'}
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(exam)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="empty-text">Your examination queue is empty.</p>
        )
      )}
    </div>
  );
}
