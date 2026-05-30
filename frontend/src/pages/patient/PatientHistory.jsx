import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { getMyExaminations } from '../../services/examinationService';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

export default function PatientHistory() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setRecords(await getMyExaminations());
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="patient-panel">
      <div className="section-title">
        <h2>My Examination History</h2>
        <p>Access your past X-Ray diagnostic parameters and reports</p>
      </div>

      {isLoading && <div className="p-4">Loading examination history...</div>}
      {errorMessage && <div className="p-4" style={{ color: '#dc2626' }}>{errorMessage}</div>}

      {!isLoading && !errorMessage && (
        <Table headers={['Exam ID', 'Date Checked', 'Radiologist', 'AI Assessment', 'Status', 'Actions']}>
          {records.map((record) => (
            <tr key={record.id}>
              <td><strong>{record.id}</strong></td>
              <td>{formatDate(record.examination_date)}</td>
              <td>{record.doctor_name || '-'}</td>
              <td>
                {record.prediction_result ? (
                  <span className={`prediction-text ${record.prediction_result.toLowerCase()}`}>
                    {record.prediction_result} ({record.confidence_percentage ?? '-'}%)
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td><StatusBadge status={record.status} /></td>
              <td>
                <Button variant="secondary" onClick={() => navigate(`/patient/examination/${record.id}`)}>
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
