import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { uploadXRayImage, getPatientExaminations } from '../../services/examinationService';

export default function DoctorPatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  // State Manajemen Data Pasien & Dokumen
  const [patientInfo, setPatientInfo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // State Status Loading & Aksi
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isScreening, setIsScreening] = useState(false);
  
  // State Hasil Analisis AI & Dokter
  const [aiResult, setAiResult] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState("");

  // ==========================================================================
  // FETCH DATA DARI DATABASE SAAT HALAMAN DI-LOAD / REFRESH
  // ==========================================================================
  useEffect(() => {
    const fetchPatientMedicalRecord = async () => {
      try {
        setIsLoadingData(true);
        
        // 1. Panggil histori pemeriksaan pasien dari backend Adin
        const examinations = await getPatientExaminations(patientId);
        
        // Integrasi Data Profil Pasien (diambil dari rekaman pemeriksaan atau disimulasikan sementara)
        // Idealnya, Adin menyediakan endpoint profil tunggal, namun di sini kita buat fallback-nya
        setPatientInfo({
          id: patientId,
          name: "Patient " + patientId,
          gender: "Male",
          dob: "1994-08-12",
          phone: "+62 812-3456-7890",
        });

        // 2. Jika pasien sudah memiliki riwayat pemeriksaan di database, tampilkan data terakhirnya
        if (examinations && examinations.length > 0) {
          const latestExam = examinations[0]; // Asumsi indeks 0 adalah rekam medis terbaru
          
          setAiResult({
            predictionResult: latestExam.prediction_result,
            confidenceScore: latestExam.confidence_score,
            imageUrl: latestExam.xray_image_url
          });
          
          if (latestExam.doctor_notes) {
            setDoctorNotes(latestExam.doctor_notes);
          }
        }
      } catch (error) {
        console.error("Gagal menarik rekam medis pasien:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (patientId) {
      fetchPatientMedicalRecord();
    }
  }, [patientId]);

  // ==========================================================================
  // HANDLER AKSI: UPLOAD & JALANKAN AI SCREENING
  // ==========================================================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Membuat blob URL lokal untuk preview gambar sementara
    }
  };

  const runAiScreening = async () => {
    if (!selectedFile) {
      alert("Silakan pilih file citra X-Ray terlebih dahulu.");
      return;
    }
    
    setIsScreening(true);
    try {
      // Mengirim file beneran ke API Multipart-FormData FastAPI Adin
      const response = await uploadXRayImage(patientId, selectedFile);
      
      // Update state berdasarkan respons JSON skema milik Adin
      setAiResult({
        predictionResult: response.prediction || response.prediction_result,
        confidenceScore: response.confidence_score,
        imageUrl: response.xray_image_url || previewUrl
      });
      
      alert("AI Screening Selesai! Hasil otomatis tersimpan di database.");
    } catch (error) {
      console.error(error);
      alert(`Terjadi kesalahan backend: ${error}`);
    } finally {
      setIsScreening(false);
    }
  };

  // ==========================================================================
  // HANDLER AKSI: VALIDASI MANUAL OLEH DOKTER
  // ==========================================================================
  const handleValidateReport = async (statusDecision) => {
    try {
      // Di sini kamu bisa menambahkan hit PUT/PATCH API jika Adin sudah membuat route update status
      alert(`Laporan medis divalidasi sebagai: ${statusDecision}\nCatatan Dokter: ${doctorNotes}`);
      navigate('/doctor/dashboard'); // Kembali ke halaman utama setelah selesai bertugas
    } catch (error) {
      alert("Gagal memperbarui status pemeriksaan.");
    }
  };

  if (isLoadingData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Memuat berkas rekam medis dari database server...
      </div>
    );
  }

  return (
    <div className="doctor-panel">
      {/* Header Utama */}
      <div className="section-title" style={{ marginBottom: '2rem' }}>
        <h2>Patient Medical Folder</h2>
        <p>Review comprehensive vitals, upload high-resolution X-Ray scans, and cross-examine AI diagnostics.</p>
      </div>

      {/* Grid Layout Utama: Responsif Desktop & Mobile */}
      <div className="patient-profile-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Bagian Atas: Ringkasan Identitas Pasien */}
        <div className="radia-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Patient Demographics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Patient ID:</span> <p style={{ fontWeight: '600' }}>{patientInfo?.id}</p></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full Name:</span> <p style={{ fontWeight: '600' }}>{patientInfo?.name}</p></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gender / DOB:</span> <p style={{ fontWeight: '600' }}>{patientInfo?.gender} / {patientInfo?.dob}</p></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Contact Registration:</span> <p style={{ fontWeight: '600' }}>{patientInfo?.phone}</p></div>
          </div>
        </div>

        {/* Bagian Bawah: Grid Dual Kolom untuk Alat Diagnosis Workspace */}
        <div className="doctor-workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Kolom Kiri: Upload Box */}
          <div className="radia-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h3 style={{ alignSelf: 'flex-start', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Diagnostic Source Input</h3>
            
            {/* Box Dropper Citra */}
            <div style={{ width: '100%', minHeight: '260px', border: '2px dashed var(--border-color)', borderRadius: '6px', background: 'var(--bg-layout)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '1rem' }}>
              {previewUrl || aiResult?.imageUrl ? (
                <img 
                  src={previewUrl || aiResult?.imageUrl} 
                  alt="X-Ray Scan Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', padding: '1rem' }}>
                  <p style={{ fontSize: '2.5rem', margin: 0 }}>🩻</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No medical image mounted yet.</p>
                </div>
              )}
            </div>

            {/* Tombol Unggah File & Tip Teks yang Sudah Diperbaiki Jaraknya */}
            <div className="upload-action-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <input 
                type="file" 
                id="xray-file-input" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <label htmlFor="xray-file-input" className="radia-btn secondary" style={{ cursor: 'pointer', padding: '0.6rem 1.2rem', background: 'var(--bg-layout)', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: '500' }}>
                {previewUrl ? "Change Selected Image" : "Select DICOM/X-Ray Image"}
              </label>

              <p className="upload-tip" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', display: 'block', window: '100%', textAlign: 'center' }}>
                Supports JPG or PNG. Max 2MB.
              </p>
            </div>

            {/* Pemicu Engine AI */}
            {selectedFile && (
              <Button 
                variant="primary" 
                onClick={runAiScreening} 
                disabled={isScreening}
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}
              >
                {isScreening ? "Processing AI Prediction Engine..." : "⚡ Run AI Classification Analysis"}
              </Button>
            )}
          </div>

          {/* Kolom Kanan: Panel Hasil AI & Input Keputusan Medis */}
          <div className="radia-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>AI Diagnostic Assessment</h3>
              
              {aiResult ? (
                <div style={{ padding: '1rem', background: 'rgba(37, 99, 235, 0.06)', borderRadius: '6px', border: '1px dashed var(--primary-color)', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Engine Conclusion Parameters:</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary-dark)', margin: '0.25rem 0' }}>
                    {aiResult.predictionResult}
                  </p>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                    Confidence Matrix Accuracy Score: <strong style={{ color: '#10B981' }}>{aiResult.confidenceScore}%</strong>
                  </span>
                </div>
              ) : (
                <div style={{ padding: '1.5rem', background: 'var(--bg-layout)', borderRadius: '6px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Waiting for active screening triggers to generate calculations.
                </div>
              )}

              {/* Input Catatan Klinis Dokter */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  Clinical Evaluation Notes (Doctor Consultation)
                </label>
                <textarea
                  rows="4"
                  placeholder="Type official radiologist diagnostic notes, mandatory observations, or custom prescriptions here..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Baris Tombol Aksi Validasi Dokumen */}
            <div className="decision-row" style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <Button 
                variant="danger" 
                onClick={() => handleValidateReport("Anomalous / Rejected")}
                style={{ flex: 1 }}
              >
                Reject / Flag Case
              </Button>
              <Button 
                variant="success" 
                onClick={() => handleValidateReport("Approved & Signed")}
                disabled={!aiResult}
                style={{ flex: 2 }}
              >
                Validate & Sign Report
              </Button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}