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
        const detail = await getMyExaminationDetail(id);
        const localAssessment = (() => {
          try {
            const cachedAssessment = localStorage.getItem(`doctor_scan_assessment_${id}`);
            return cachedAssessment ? JSON.parse(cachedAssessment) : null;
          } catch {
            return null;
          }
        })();
        const localFinalReview = (() => {
          try {
            const cachedReview = localStorage.getItem(`doctor_final_review_${id}`);
            return cachedReview ? JSON.parse(cachedReview) : null;
          } catch {
            return null;
          }
        })();

        setExam({
          ...detail,
          symptoms_description:
            detail.symptoms_description || localAssessment?.symptoms_description || null,
          preliminary_solution:
            detail.preliminary_solution || localAssessment?.preliminary_solution || null,
          final_diagnosis_result:
            detail.final_diagnosis_result || localFinalReview?.final_diagnosis_result || null,
          final_doctor_note:
            detail.final_doctor_note || localFinalReview?.final_doctor_note || null,
          status: localFinalReview?.status || detail.status,
          report: detail.report || localFinalReview?.report || null,
        });
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
    return <div className="p-4">Loading examination details...</div>;
  }

  if (!exam) {
    return <div className="p-4" style={{ color: '#dc2626' }}>{errorMessage || 'Examination log was not found.'}</div>;
  }

  const isFinalized = exam.status === 'ready';
  const finalDiagnosis = isFinalized ? exam.final_diagnosis_result || '-' : 'Still under review';
  const finalDoctorNote = isFinalized
    ? exam.final_doctor_note || '-'
    : 'Your scan is still being reviewed by the assigned medical staff.';

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
        <Card title="Chest X-Ray Image">
          <div className="xray-frame">
            {exam.xray_image?.image_download_url ? (
              <img
                src={exam.xray_image.image_download_url}
                alt={exam.xray_image.file_name || 'Chest X-Ray Image'}
              />
            ) : exam.xray_image?.file_name ? (
              <p className="clinical-notes">{exam.xray_image.file_name}</p>
            ) : (
              <div className="xray-empty-state">
                <p>X-Ray image is not available yet.</p>
              </div>
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
              <span className="label">Examination Date</span>
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
            {!isFinalized && (
              <>
                <div className="meta-item">
                  <span className="label">Symptoms</span>
                  <span className="val">{exam.symptoms_description || '-'}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Preliminary Solution</span>
                  <span className="val">{exam.preliminary_solution || '-'}</span>
                </div>
              </>
            )}
            <div className="meta-item border-top">
              <span className="label">Final Diagnosis</span>
              <span className={`val thick ${exam.final_diagnosis_result?.toLowerCase() || ''}`}>
                {finalDiagnosis}
              </span>
            </div>
          </Card>

          <Card title="Doctor Evaluation Notes">
            <p className="clinical-notes">{finalDoctorNote}</p>
            <div className="signature-block">
              <p>Responsible Doctor,</p>
              <h4>{exam.doctor?.full_name || exam.doctor?.email || '-'}</h4>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
