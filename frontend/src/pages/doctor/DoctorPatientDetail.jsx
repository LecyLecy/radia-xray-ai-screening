import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { mockPatients, mockExaminations } from '../../data/mockData';
import '../styles/doctor.css';

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const patient = mockPatients.find(p => p.id === id);
  
  // State for examinations list
  const [exams, setExams] = useState(mockExaminations.filter(e => e.patientId === id));
  
  // Screening workflow states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScreening, setIsScreening] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [doctorNote, setDoctorNote] = useState('');

  if (!patient) {
    return <div className="p-4">Patient record missing from registry.</div>;
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
      // reset state screening sebelumnya
      setAiResult(null);
    }
  };

  const runAiScreening = () => {
    if (!selectedFile) return;
    setIsScreening(true);

    // Simulasi respons latensi inference engine AI
    setTimeout(() => {
      setIsScreening(false);
      setAiResult({
        predictionResult: Math.random() > 0.5 ? 'Pneumonia' : 'Normal',
        confidenceScore: parseFloat((solidRandom(85, 99)).toFixed(1))
      });
    }, 1500);
  };

  const solidRandom = (min, max) => Math.random() * (max - min) + min;

  const handleSaveExamination = (validationStatus) => {
    if (!aiResult) return;

    const newExam = {
      id: `EX${String(mockExaminations.length + 1).padStart(3, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      date: new Date().toISOString().split('T')[0],
      doctorName: "Dr. Hendra Kurniawan, Sp.Rad",
      predictionResult: aiResult.predictionResult,
      confidenceScore: aiResult.confidenceScore,
      status: validationStatus,
      doctorNote: doctorNote,
      xrayUrl: previewUrl
    };

    setExams([newExam, ...exams]);
    
    // Reset screening tab area
    setSelectedFile(null);
    setPreviewUrl(null);
    setAiResult(null);
    setDoctorNote('');
    alert(`Case logged successfully as: [${validationStatus}]`);
  };

  return (
    <div className="doctor-panel">
      <div className="section-title">
        <h2>Patient File: {patient.name}</h2>
        <p>ID: {patient.id} | DOB: {patient.dob} | Gender: {patient.gender}</p>
      </div>

      <div className="doctor-workspace-grid">
        {/* Kolom Kiri: Evaluasi & Screening Baru */}
        <div className="workspace-column">
          <Card title="Initiate AI-Assisted Screening">
            <div className="upload-dropzone">
              <input type="file" accept="image/*" id="xray-upload" onChange={handleFileChange} />
              <label htmlFor="xray-upload" className="dropzone-label">
                {previewUrl ? "Change Selected X-Ray Specimen" : "Select Chest X-Ray Specimen Image"}
              </label>
            </div>

            {previewUrl && (
              <div className="screening-workspace">
                <div className="workspace-xray-preview">
                  <img src={previewUrl} alt="Preview Target" />
                </div>

                {!aiResult && !isScreening && (
                  <Button variant="primary" onClick={runAiScreening} className="w-full">
                    Execute Radiometrix ML Screening
                  </Button>
                )}

                {isScreening && <div className="pulse-loader">Analyzing Specimen Vector Matrices...</div>}

                {aiResult && (
                  <div className="ai-inference-box">
                    <h4>Inference Result Engine</h4>
                    <p className={`inference-outcome ${aiResult.predictionResult.toLowerCase()}`}>
                      Classification: <strong>{aiResult.predictionResult}</strong>
                    </p>
                    <p className="inference-confidence">Confidence Index: {aiResult.confidenceScore}%</p>

                    <div className="doctor-input-zone">
                      <label className="radia-label">Clinical Observations & Directives</label>
                      <textarea
                        className="radia-textarea"
                        value={doctorNote}
                        onChange={(e) => setDoctorNote(e.target.value)}
                        placeholder="Write down patient pathology details or prescription orders..."
                      />
                    </div>

                    <div className="decision-row">
                      <Button variant="secondary" onClick={() => handleSaveExamination('Reviewed')}>
                        Save & Hold (Reviewed)
                      </Button>
                      <Button variant="primary" onClick={() => handleSaveExamination('Report Ready')}>
                        Validate & Publish (Report Ready)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Kolom Kanan: Histori Pasien Ini */}
        <div className="workspace-column">
          <Card title="Patient Examination History Logs">
            {exams.length === 0 ? (
              <p className="empty-text">No previous diagnostic cases recorded for this profile.</p>
            ) : (
              <Table headers={["ID", "Date", "Inference", "Status"]}>
                {exams.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.id}</strong></td>
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
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}