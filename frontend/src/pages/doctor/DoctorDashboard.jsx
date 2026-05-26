import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { mockExaminations } from '../../data/mockData';
import '../styles/doctor.css';

export default function DoctorDashboard() {
  const pendingCount = mockExaminations.filter(e => e.status === 'Pending Review').length;
  const reviewedCount = mockExaminations.filter(e => e.status === 'Reviewed' || e.status === 'Report Ready').length;

  return (
    <div className="doctor-panel">
      <div className="section-title">
        <h2>Clinical Metrics Dashboard</h2>
        <p>Overview of current screening queues and workflow logs</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card warning">
          <span className="metric-label">Awaiting Evaluation</span>
          <h2 className="metric-value">{pendingCount} Patients</h2>
        </div>
        <div className="metric-card primary">
          <span className="metric-label">Processed Diagnostics</span>
          <h2 className="metric-value">{reviewedCount} Cases</h2>
        </div>
      </div>

      <Card title="Active Operational Queue">
        <Table headers={["Exam ID", "Patient Target", "Screening Instance", "System Inference", "Status"]}>
          {mockExaminations.map((e) => (
            <tr key={e.id}>
              <td><strong>{e.id}</strong></td>
              <td>{e.patientName}</td>
              <td>{e.date}</td>
              <td>
                <span className={`prediction-text ${e.predictionResult.toLowerCase()}`}>
                  {e.predictionResult} ({e.confidenceScore}%)
                </span>
              </td>
              <td><StatusBadge status={e.status} /></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}