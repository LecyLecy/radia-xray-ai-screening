import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { mockExaminations } from '../../data/mockData';
import '../styles/patient.css';

export default function PatientExaminationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exam = mockExaminations.find(e => e.id === id);

  if (!exam) {
    return <div className="p-4">Examination log not found.</div>;
  }

  const handleDownloadPDF = () => {
    alert(`[PDF Download] Generating document Radia_Report_${exam.id}.pdf...`);
  };

  return (
    <div className="patient-panel">
      <div className="header-action-row">
        <Button variant="secondary" onClick={() => navigate('/patient/history')}>← Back to History</Button>
        {exam.status === "Report Ready" && (
          <Button variant="primary" onClick={handleDownloadPDF}>Download Official PDF Report</Button>
        )}
      </div>

      <div className="grid-detail-view">
        <Card title="Acquired Chest X-Ray Specimen">
          <div className="xray-frame">
            <img src={exam.xrayUrl} alt="Chest X-Ray" />
          </div>
        </Card>

        <div className="detail-meta-stack">
          <Card title="Analysis Parameters">
            <div className="meta-item">
              <span className="label">Examination ID</span>
              <span className="val"><strong>{exam.id}</strong></span>
            </div>
            <div className="meta-item">
              <span className="label">Date of Capture</span>
              <span className="val">{exam.date}</span>
            </div>
            <div className="meta-item">
              <span className="label">Status</span>
              <span className="val"><StatusBadge status={exam.status} /></span>
            </div>
            <div className="meta-item border-top">
              <span className="label">AI Screening Diagnostics</span>
              <span className={`val thick ${exam.predictionResult.toLowerCase()}`}>
                {exam.predictionResult}
              </span>
            </div>
            <div className="meta-item">
              <span className="label">Statistical Accuracy</span>
              <span className="val font-mono">{exam.confidenceScore}%</span>
            </div>
          </Card>

          <Card title="Radiologist Evaluation Note">
            <p className="clinical-notes">
              {exam.doctorNote || "Clinical evaluations are being reviewed by the designated medical specialist."}
            </p>
            <div className="signature-block">
              <p>Attending Radiologist,</p>
              <h4>{exam.doctorName}</h4>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}