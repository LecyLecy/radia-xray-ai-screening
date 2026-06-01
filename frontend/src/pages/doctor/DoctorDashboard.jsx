import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { getDoctorExaminations } from '../../services/examinationService';
import '../styles/doctor.css';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

export default function DoctorDashboard() {
  const [examinations, setExaminations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setExaminations(await getDoctorExaminations());
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const pendingCount = examinations.filter((exam) => exam.status !== 'ready').length;
  const completedCount = examinations.filter((exam) => exam.status === 'ready').length;
  const recentExaminations = examinations.slice(0, 5);

  return (
    <div className="doctor-panel">
      <div className="section-title">
        <h2>Clinical Metrics Dashboard</h2>
        <p>Summary of the current screening queue and workflow log</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card warning">
          <span className="metric-label">Awaiting Evaluation</span>
          <h2 className="metric-value">{pendingCount} Patients</h2>
        </div>
        <div className="metric-card primary">
          <span className="metric-label">Diagnostics Processed</span>
          <h2 className="metric-value">{completedCount} Cases</h2>
        </div>
        <div className="metric-card neutral">
          <span className="metric-label">My Queue</span>
          <h2 className="metric-value">{examinations.length} Scan</h2>
        </div>
      </div>

      <Card title="Active Operational Queue">
        {isLoading && <p className="empty-text">Loading dashboard data...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}
        {!isLoading && !errorMessage && recentExaminations.length === 0 && (
          <p className="empty-text">No examinations have been created yet.</p>
        )}
        {!isLoading && !errorMessage && recentExaminations.length > 0 && (
          <Table headers={["Examination ID", "Patient", "Email", "Screening Time", "System Inference", "Status"]}>
            {recentExaminations.map((exam) => (
              <tr key={exam.id}>
                <td><strong>{exam.id}</strong></td>
                <td>{exam.patient_name || exam.patient_id}</td>
                <td>{exam.patient_email || '-'}</td>
                <td>{formatDate(exam.examination_date)}</td>
                <td>
                  {exam.prediction_result ? (
                    <span className={`prediction-text ${exam.prediction_result.toLowerCase()}`}>
                      {exam.prediction_result} ({exam.confidence_percentage ?? '-'}%)
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td><StatusBadge status={exam.status} /></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
