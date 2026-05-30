import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import {
  createExamination,
  generateReport,
  getDoctorPatient,
  getReportDownload,
  predictExamination,
  saveDoctorFeedback,
  updateDoctorNote,
} from '../../services/examinationService';

export default function DoctorPatientDetail() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [examinationId, setExaminationId] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [doctorNote, setDoctorNote] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('correct');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScreening, setIsScreening] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        setPatient(await getDoctorPatient(patientId));
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrorMessage('Only JPG and PNG X-Ray images are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('X-Ray image must be 10 MB or smaller.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAiResult(null);
    setReport(null);
  };

  const runAiScreening = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a JPG or PNG X-Ray image first.');
      return;
    }

    setIsScreening(true);
    setErrorMessage('');

    try {
      const examination = await createExamination(patientId);
      const prediction = await predictExamination(examination.id, selectedFile);

      setExaminationId(examination.id);
      setAiResult(prediction);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsScreening(false);
    }
  };

  const handleOpenReport = async () => {
    if (!report?.id) return;

    setIsDownloadingReport(true);
    setErrorMessage('');

    try {
      const download = await getReportDownload(report.id);
      window.open(download.download_url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleSaveReview = async () => {
    if (!examinationId || !aiResult) {
      setErrorMessage('Run AI screening before saving doctor review.');
      return;
    }

    if (!doctorNote.trim()) {
      setErrorMessage('Doctor note is required before generating a report.');
      return;
    }

    setIsSavingReview(true);
    setErrorMessage('');

    try {
      await updateDoctorNote(examinationId, doctorNote.trim());
      await saveDoctorFeedback(examinationId, feedbackStatus, feedbackNote.trim() || null);
      const generatedReport = await generateReport(examinationId);
      setReport(generatedReport);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading patient data...
      </div>
    );
  }

  if (!patient) {
    return <div style={{ padding: '2rem', color: '#dc2626' }}>{errorMessage || 'Patient not found.'}</div>;
  }

  return (
    <div className="doctor-panel">
      <div className="section-title" style={{ marginBottom: '2rem' }}>
        <h2>Patient Medical Folder</h2>
        <p>Review patient profile, upload an X-Ray image, and save doctor validation.</p>
      </div>

      {errorMessage && (
        <div style={{ padding: '1rem', marginBottom: '1rem', color: '#dc2626', background: '#fef2f2', borderRadius: '6px' }}>
          {errorMessage}
        </div>
      )}

      <div className="patient-profile-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="radia-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Patient Demographics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Patient ID:</span> <p style={{ fontWeight: '600' }}>{patient.id}</p></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full Name:</span> <p style={{ fontWeight: '600' }}>{patient.full_name}</p></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gender / Age:</span> <p style={{ fontWeight: '600' }}>{patient.gender || '-'} / {patient.age ?? '-'}</p></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Contact:</span> <p style={{ fontWeight: '600' }}>{patient.phone_number || '-'}</p></div>
          </div>
        </div>

        <div className="doctor-workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div className="radia-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ alignSelf: 'flex-start', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Diagnostic Source Input</h3>

            <div style={{ width: '100%', minHeight: '260px', border: '2px dashed var(--border-color)', borderRadius: '6px', background: 'var(--bg-layout)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '1rem' }}>
              {previewUrl ? (
                <img src={previewUrl} alt="X-Ray scan preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ color: 'var(--text-muted)', padding: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No X-Ray image selected yet.</p>
                </div>
              )}
            </div>

            <input
              type="file"
              id="xray-file-input"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="xray-file-input" className="radia-btn secondary" style={{ cursor: 'pointer', padding: '0.6rem 1.2rem', background: 'var(--bg-layout)', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: '500' }}>
              {previewUrl ? 'Change Selected Image' : 'Select X-Ray Image'}
            </label>

            <p className="upload-tip" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
              Supports JPG or PNG. Max 10 MB.
            </p>

            <Button
              variant="primary"
              onClick={runAiScreening}
              disabled={!selectedFile || isScreening}
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}
            >
              {isScreening ? 'Processing AI Prediction...' : 'Run AI Classification Analysis'}
            </Button>
          </div>

          <div className="radia-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>AI Diagnostic Assessment</h3>

            {aiResult ? (
              <div style={{ padding: '1rem', background: 'rgba(37, 99, 235, 0.06)', borderRadius: '6px', border: '1px dashed var(--primary-color)', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Engine conclusion:</span>
                <p style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary-dark)', margin: '0.25rem 0' }}>
                  {aiResult.prediction_result}
                </p>
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  Confidence: <strong style={{ color: '#10B981' }}>{aiResult.confidence_percentage}%</strong>
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Model: {aiResult.model_name} | Mock: {String(aiResult.is_mock)}
                </p>
              </div>
            ) : (
              <div style={{ padding: '1.5rem', background: 'var(--bg-layout)', borderRadius: '6px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Waiting for active screening results.
              </div>
            )}

            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Clinical Evaluation Notes
            </label>
            <textarea
              rows="4"
              placeholder="Write doctor clinical note before generating the PDF report."
              value={doctorNote}
              onChange={(event) => setDoctorNote(event.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1rem' }}
            />

            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
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
              rows="3"
              placeholder="Optional feedback note."
              value={feedbackNote}
              onChange={(event) => setFeedbackNote(event.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1rem' }}
            />

            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <Button variant="secondary" onClick={() => navigate('/doctor/patients')} style={{ flex: 1 }}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveReview}
                disabled={!aiResult || isSavingReview}
                style={{ flex: 2 }}
              >
                {isSavingReview ? 'Saving Review...' : 'Save Review & Generate Report'}
              </Button>
            </div>

            {report && (
              <div style={{ marginTop: '1rem', color: '#059669', fontWeight: 600 }}>
                <p>Report ready: {report.id}</p>
                <Button
                  variant="secondary"
                  onClick={handleOpenReport}
                  disabled={isDownloadingReport}
                  style={{ marginTop: '0.75rem', width: '100%' }}
                >
                  {isDownloadingReport ? 'Preparing Report...' : 'Open Generated PDF'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
