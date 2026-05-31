import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { getMyExaminationDetail, getReportDownload } from '../../services/examinationService';
import '../styles/patient.css';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

export default function PatientExaminationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setExam(await getMyExaminationDetail(id));
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!exam?.report?.id) return;

    setIsDownloading(true);
    setErrorMessage('');

    try {
      const download = await getReportDownload(exam.report.id);
      window.open(download.download_url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading examination detail...</div>;
  }

  if (!exam) {
    return <div className="p-4" style={{ color: '#dc2626' }}>{errorMessage || 'Examination log not found.'}</div>;
  }

  const isFinalized = ['reviewed', 'report_ready'].includes(exam.status);

  return (
    <div className="patient-panel">
      <div className="header-action-row">
        <Button variant="secondary" onClick={() => navigate('/patient/history')}>Back to History</Button>
        {exam.report?.id && (
          <Button variant="primary" onClick={handleDownloadPDF} disabled={isDownloading}>
            {isDownloading ? 'Preparing Download...' : 'Download Official PDF Report'}
          </Button>
        )}
      </div>

      {errorMessage && <div className="p-4" style={{ color: '#dc2626' }}>{errorMessage}</div>}

      <div className="grid-detail-view">
        <Card title="Acquired Chest X-Ray Specimen">
          <div className="xray-frame">
            {exam.xray_image?.image_url ? (
              <p className="clinical-notes">
                Private storage path: {exam.xray_image.image_url}
              </p>
            ) : (
              <p className="clinical-notes">No X-Ray image metadata is available yet.</p>
            )}
          </div>
        </Card>

        <div className="detail-meta-stack">
          <Card title="Examination Summary">
            <div className="meta-item">
              <span className="label">Examination ID</span>
              <span className="val"><strong>{exam.id}</strong></span>
            </div>
            <div className="meta-item">
              <span className="label">Date of Capture</span>
              <span className="val">{formatDate(exam.examination_date)}</span>
            </div>
            <div className="meta-item">
              <span className="label">Status</span>
              <span className="val"><StatusBadge status={exam.status} /></span>
            </div>
            <div className="meta-item">
              <span className="label">Doctor</span>
              <span className="val">{exam.doctor?.full_name || exam.doctor?.email || '-'}</span>
            </div>
            <div className="meta-item">
              <span className="label">Symptoms</span>
              <span className="val">{exam.symptoms_description || '-'}</span>
            </div>
            <div className="meta-item">
              <span className="label">Preliminary Solution</span>
              <span className="val">{exam.preliminary_solution || '-'}</span>
            </div>
            <div className="meta-item border-top">
              <span className="label">Final Diagnosis</span>
              <span className={`val thick ${exam.final_diagnosis_result?.toLowerCase() || ''}`}>
                {isFinalized ? exam.final_diagnosis_result || '-' : 'Still under review'}
              </span>
            </div>
          </Card>

          <Card title="Doctor Evaluation Note">
            <p className="clinical-notes">
              {isFinalized
                ? exam.final_doctor_note || 'Final doctor note is not available yet.'
                : 'Your scan is still being checked by the designated medical specialist.'}
            </p>
            <div className="signature-block">
              <p>Attending Radiologist,</p>
              <h4>{exam.doctor?.full_name || exam.doctor?.email || '-'}</h4>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
