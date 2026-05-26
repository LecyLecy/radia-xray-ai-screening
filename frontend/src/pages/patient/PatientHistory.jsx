import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { mockExaminations } from '../../data/mockData';

export default function PatientHistory() {
  const navigate = useNavigate();
  
  // Filter history specific to patient P001
  const records = mockExaminations.filter(e => e.patientId === 'P001');

  return (
    <div className="patient-panel">
      <div className="section-title">
        <h2>My Examination History</h2>
        <p>Access your past X-Ray diagnostic parameters and reports</p>
      </div>

      <Table headers={["Exam ID", "Date Checked", "Radiologist", "AI Assessment", "Status", "Actions"]}>
        {records.map((r) => (
          <tr key={r.id}>
            <td><strong>{r.id}</strong></td>
            <td>{r.date}</td>
            <td>{r.doctorName}</td>
            <td>
              <span className={`prediction-text ${r.predictionResult.toLowerCase()}`}>
                {r.predictionResult} ({r.confidenceScore}%)
              </span>
            </td>
            <td><StatusBadge status={r.status} /></td>
            <td>
              <Button variant="secondary" onClick={() => navigate(`/patient/examination/${r.id}`)}>
                View Details
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}