import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import {
  deleteDoctorExamination,
  generateReport,
  getDoctorExaminationDetail,
  getReportDownload,
  saveFinalDoctorReview,
} from '../../services/examinationService';
import '../styles/doctor.css';
import '../styles/patient.css';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

export default function DoctorExaminationDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [finalDiagnosis, setFinalDiagnosis] = useState('Normal');
  const [finalNote, setFinalNote] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('correct');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setIsLoading(true);
        const detail = await getDoctorExaminationDetail(id);
        const localAssessment = (() => {
          const stateAssessment = location.state?.assessment;
          if (stateAssessment) return stateAssessment;

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

        const mergedDetail = {
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
        };

        setExam(mergedDetail);
        setFinalDiagnosis(mergedDetail.final_diagnosis_result || detail.ai_prediction?.prediction_result || 'Normal');
        setFinalNote(mergedDetail.final_doctor_note || detail.doctor_note || '');
        setFeedbackStatus(detail.doctor_feedback?.feedback_status || 'correct');
        setFeedbackNote(detail.doctor_feedback?.feedback_note || '');
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadDetail();
    }
  }, [id, location.state]);

  const handleSaveReview = async () => {
    if (!finalNote.trim()) {
      setErrorMessage('Final doctor note is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const updated = await saveFinalDoctorReview(
        id,
        finalDiagnosis,
        finalNote.trim(),
        feedbackStatus,
        feedbackNote.trim() || null,
      );
      let report = null;
      try {
        report = await generateReport(id);
      } catch (reportError) {
        setErrorMessage(reportError.message);
      }
      const finalReviewCache = {
        final_diagnosis_result: finalDiagnosis,
        final_doctor_note: finalNote.trim(),
        status: 'ready',
        report,
      };
      localStorage.setItem(`doctor_final_review_${id}`, JSON.stringify(finalReviewCache));
      setExam((current) => ({
        ...current,
        ...updated,
        status: 'ready',
        report,
        symptoms_description: null,
        preliminary_solution: null,
        final_diagnosis_result: updated.final_diagnosis_result || finalDiagnosis,
        final_doctor_note: updated.final_doctor_note || finalNote.trim(),
        doctor_feedback: {
          ...(current?.doctor_feedback || {}),
          feedback_status: feedbackStatus,
          feedback_note: feedbackNote.trim() || null,
        },
      }));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setErrorMessage('');

    try {
      const report = await generateReport(id);
      setExam((current) => ({
        ...current,
        status: 'ready',
        report,
      }));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenReport = async () => {
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

  const handleDeleteExamination = async () => {
    const confirmed = window.confirm('Delete this examination? Related AI data, X-Ray image, feedback, and reports will also be deleted.');
    if (!confirmed) return;

    setErrorMessage('');
    try {
      await deleteDoctorExamination(id);
      localStorage.removeItem(`doctor_scan_assessment_${id}`);
      navigate('/doctor/examinations');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading examination...</div>;
  }

  if (!exam) {
    return <div style={{ padding: '2rem', color: '#dc2626' }}>{errorMessage || 'Examination was not found.'}</div>;
  }

  const aiPrediction = exam.ai_prediction;
  const isFinalized = exam.status === 'ready';

  return (
    <div className="doctor-panel">
      <div className="header-action-row">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => navigate('/doctor/examinations')}>Back to Queue</Button>
          <Button variant="danger" onClick={handleDeleteExamination}>Delete Examination</Button>
        </div>
        <StatusBadge status={exam.status} />
      </div>

      {errorMessage && (
        <div style={{ padding: '1rem', marginBottom: '1rem', color: '#dc2626', background: '#fef2f2', borderRadius: '6px' }}>
          {errorMessage}
        </div>
      )}

      <div className="grid-detail-view">
        <div className="detail-meta-stack">
          <Card title="Patient Information">
            <div className="meta-item">
              <span className="label">Full Name</span>
              <span className="val">{exam.patient?.full_name || '-'}</span>
            </div>
            <div className="meta-item">
              <span className="label">Email</span>
              <span className="val">{exam.patient?.email || '-'}</span>
            </div>
            <div className="meta-item">
              <span className="label">Gender / Age</span>
              <span className="val">{exam.patient?.gender || '-'} / {exam.patient?.age ?? '-'}</span>
            </div>
            <div className="meta-item">
              <span className="label">Date</span>
              <span className="val">{formatDate(exam.examination_date)}</span>
            </div>
          </Card>

          {!isFinalized && (
            <Card title="Initial Assessment">
              <div className="meta-item">
                <span className="label">Symptoms</span>
                <span className="val">{exam.symptoms_description || '-'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Preliminary Solution</span>
                <span className="val">{exam.preliminary_solution || '-'}</span>
              </div>
            </Card>
          )}

          <Card title="Scan and AI Decision Support">
            <div className="xray-frame">
              {exam.xray_image?.image_download_url ? (
                <img
                  src={exam.xray_image.image_download_url}
                  alt={exam.xray_image.file_name || 'X-Ray Image'}
                />
              ) : (
                <div className="xray-empty-state">
                  <p>X-Ray image is not available for preview yet.</p>
                </div>
              )}
            </div>
            <div className="meta-item border-top">
              <span className="label">AI Result</span>
              <span className={`val thick ${aiPrediction?.prediction_result?.toLowerCase() || ''}`}>
                {aiPrediction?.prediction_result || '-'}
              </span>
            </div>
            <div className="meta-item">
              <span className="label">Confidence</span>
              <span className="val">{aiPrediction?.confidence_percentage ?? '-'}%</span>
            </div>
          </Card>
        </div>

        <Card title="Final Doctor Review">
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Final Diagnosis
          </label>
          <select
            value={finalDiagnosis}
            onChange={(event) => setFinalDiagnosis(event.target.value)}
            disabled={isFinalized}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}
          >
            <option value="Normal">Normal</option>
            <option value="Pneumonia">Pneumonia</option>
          </select>

          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Final Doctor Note
          </label>
          <textarea
            rows="6"
            value={finalNote}
            onChange={(event) => setFinalNote(event.target.value)}
            disabled={isFinalized}
            placeholder="Final instructions for the patient."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1rem' }}
          />

          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Feedback AI
          </label>
          <select
            value={feedbackStatus}
            onChange={(event) => setFeedbackStatus(event.target.value)}
            disabled={isFinalized}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}
          >
            <option value="correct">Correct</option>
            <option value="incorrect">Incorrect</option>
            <option value="uncertain">Uncertain</option>
          </select>

          <textarea
            rows="4"
            value={feedbackNote}
            onChange={(event) => setFeedbackNote(event.target.value)}
            disabled={isFinalized}
            placeholder="Optional AI feedback notes."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1rem' }}
          />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {!isFinalized && (
              <Button variant="primary" onClick={handleSaveReview} disabled={isSaving}>
                {isSaving ? 'Saving and Creating PDF...' : 'Save Final Review'}
              </Button>
            )}
            {isFinalized && !exam.report?.id && (
              <Button variant="primary" onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? 'Creating...' : 'Download PDF'}
              </Button>
            )}
            {isFinalized && exam.report?.id && (
              <Button variant="secondary" onClick={handleOpenReport} disabled={isDownloading}>
                {isDownloading ? 'Preparing...' : 'Download PDF'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
