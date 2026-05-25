import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { getPatientExaminations } from '../../services/examinationService'; // Import API Service

export default function PatientHistory() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ambil ID pasien yang sedang login (sementara kita ambil dari localStorage)
  const currentPatientId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getPatientExaminations(currentPatientId);
        setRecords(data); // Simpan respons dari backend ke state
      } catch (error) {
        console.error("Gagal mengambil histori:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [currentPatientId]);

  return (
    <div className="patient-panel">
      <div className="section-title">
        <h2>My Examination History</h2>
        <p>Access your past X-Ray diagnostic parameters and reports</p>
      </div>

      {isLoading ? (
        <div className="p-4">Memuat data dari server...</div>
      ) : (
        <Table headers={["Exam ID", "Date Checked", "Radiologist", "AI Assessment", "Status", "Actions"]}>
          {records.map((r) => (
            <tr key={r.id}>
              <td><strong>{r.id}</strong></td>
              {/* Pastikan nama key (seperti r.created_at) cocok dengan nama kolom di database Supabase Adin */}
              <td>{new Date(r.created_at).toLocaleDateString()}</td>
              <td>{r.doctor_name || 'Dr. Hendra Kurniawan'}</td>
              <td>
                <span className={`prediction-text ${r.prediction_result?.toLowerCase()}`}>
                  {r.prediction_result} ({r.confidence_score}%)
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
      )}
    </div>
  );
}