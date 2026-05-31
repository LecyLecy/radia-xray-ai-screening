import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import {
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
        setExam(detail);
        setFinalDiagnosis(detail.final_diagnosis_result || detail.ai_prediction?.prediction_result || 'Normal');
        setFinalNote(detail.final_doctor_note || detail.doctor_note || '');
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
  }, [id]);

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
      setExam((current) => ({
        ...current,
        ...updated,
        final_diagnosis_result: updated.final_diagnosis_result,
        final_doctor_note: updated.final_doctor_note,
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

  if (isLoading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading examination...</div>;
  }

  if (!exam) {
    return <div style={{ padding: '2rem', color: '#dc2626' }}>{errorMessage || 'Examination not found.'}</div>;
  }

  const aiPrediction = exam.ai_prediction;
  const canGenerateReport = Boolean(exam.final_diagnosis_result && exam.final_doctor_note);

  return (
    <div className="doctor-panel">
      <div className="header-action-row">
        <Button variant="secondary" onClick={() => navigate('/doctor/examinations')}>Back to Queue</Button>
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

          <Card title="Scan and AI Decision Support">
            <p className="clinical-notes">
              X-Ray storage path: {exam.xray_image?.image_url || '-'}
            </p>
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
            placeholder="Final instruction for the patient."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1rem' }}
          />

          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            AI Feedback
          </label>
          <select
            value={feedbackStatus}
            onChange={(event) => setFeedbackStatus(event.target.value)}
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
            placeholder="Optional AI feedback note."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1rem' }}
          />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={handleSaveReview} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Final Review'}
            </Button>
            <Button variant="secondary" onClick={handleGenerateReport} disabled={!canGenerateReport || isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate PDF'}
            </Button>
            {exam.report?.id && (
              <Button variant="secondary" onClick={handleOpenReport} disabled={isDownloading}>
                {isDownloading ? 'Preparing...' : 'Open PDF'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
