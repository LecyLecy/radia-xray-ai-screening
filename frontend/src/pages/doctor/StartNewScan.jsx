import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { startDoctorExamination } from '../../services/examinationService';
import '../styles/doctor.css';

export default function StartNewScan() {
  const navigate = useNavigate();
  const [patientEmail, setPatientEmail] = useState('');
  const [symptomsDescription, setSymptomsDescription] = useState('');
  const [preliminarySolution, setPreliminarySolution] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!selectedFile) {
      setErrorMessage('Please upload a JPG or PNG X-Ray image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await startDoctorExamination({
        patientEmail: patientEmail.trim(),
        symptomsDescription: symptomsDescription.trim(),
        preliminarySolution: preliminarySolution.trim(),
        xrayImage: selectedFile,
      });
      navigate(`/doctor/examinations/${result.examination_id}`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="doctor-panel">
      <div className="section-title">
        <h2>Start New Scan</h2>
        <p>Find a registered patient by email, upload the scan, and run AI support in one step.</p>
      </div>

      {errorMessage && (
        <div style={{ padding: '1rem', marginBottom: '1rem', color: '#dc2626', background: '#fef2f2', borderRadius: '6px' }}>
          {errorMessage}
        </div>
      )}

      <form className="doctor-workspace-grid" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <div className="radia-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Patient and Initial Assessment</h3>

          <label className="form-label" htmlFor="patient-email">Patient Email</label>
          <input
            id="patient-email"
            className="radia-input"
            type="email"
            value={patientEmail}
            onChange={(event) => setPatientEmail(event.target.value)}
            placeholder="patient@example.com"
            required
          />

          <label className="form-label" htmlFor="symptoms-description" style={{ marginTop: '1rem' }}>Symptoms / Keluhan</label>
          <textarea
            id="symptoms-description"
            rows="5"
            value={symptomsDescription}
            onChange={(event) => setSymptomsDescription(event.target.value)}
            placeholder="Describe patient symptoms and complaint context."
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical', fontFamily: 'inherit' }}
          />

          <label className="form-label" htmlFor="preliminary-solution" style={{ marginTop: '1rem' }}>Preliminary Solution</label>
          <textarea
            id="preliminary-solution"
            rows="5"
            value={preliminarySolution}
            onChange={(event) => setPreliminarySolution(event.target.value)}
            placeholder="Temporary instruction visible to the patient while review is pending."
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div className="radia-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>X-Ray Upload</h3>

          <div style={{ width: '100%', minHeight: '280px', border: '2px dashed var(--border-color)', borderRadius: '6px', background: 'var(--bg-layout)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '1rem' }}>
            {previewUrl ? (
              <img src={previewUrl} alt="X-Ray scan preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <p className="empty-text">No X-Ray image selected.</p>
            )}
          </div>

          <input
            type="file"
            id="xray-file-input"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="xray-file-input" className="radia-btn secondary" style={{ cursor: 'pointer', textAlign: 'center', padding: '0.7rem 1rem', background: 'var(--bg-layout)', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 600 }}>
            {selectedFile ? selectedFile.name : 'Select JPG or PNG Scan'}
          </label>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            style={{ marginTop: 'auto', padding: '0.85rem' }}
          >
            {isSubmitting ? 'Creating Scan...' : 'Create Scan and Run AI'}
          </Button>
        </div>
      </form>
    </div>
  );
}
