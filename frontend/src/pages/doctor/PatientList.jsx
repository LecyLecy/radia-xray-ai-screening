import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';

import { getAllPatients } from '../../services/examinationService';

export default function PatientList() {
  const navigate = useNavigate();
  
  // State untuk menyimpan data dari backend dan status loading
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mengambil data dari backend saat komponen dimuat
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getAllPatients();
        console.log("Data asli dari backend Adin:", data);
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        alert("Gagal memuat daftar pasien. Pastikan backend menyala.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="doctor-panel">
      <div className="section-title">
        <h2>Patient Registry</h2>
        <p>Select a patient to evaluate history or trigger fresh diagnostics</p>
      </div>

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Memuat data pasien dari database server...
        </div>
      ) : (
        <Table headers={["Patient ID", "Full Name", "Contact", "Date of Birth", "Gender", "Action"]}>
          {patients.map((p) => (
            <tr key={p.id}>
              <td><strong>{p.id}</strong></td>
              {/* Pastikan key (name, phone, dob, gender) sesuai dengan skema tabel database Supabase Adin */}
              <td>{p.name}</td>
              <td>{p.phone}</td>
              <td>{p.dob}</td>
              <td>{p.gender}</td>
              <td>
                <Button variant="primary" onClick={() => navigate(`/doctor/patient/${p.id}`)}>
                  Open Medical File
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}