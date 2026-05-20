import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { mockPatients } from '../../data/mockData';

export default function PatientList() {
  const navigate = useNavigate();

  return (
    <div className="doctor-panel">
      <div className="section-title">
        <h2>Patient Registry</h2>
        <p>Select a patient to evaluate history or trigger fresh diagnostics</p>
      </div>

      <Table headers={["Patient ID", "Full Name", "Contact", "Date of Birth", "Gender", "Action"]}>
        {mockPatients.map((p) => (
          <tr key={p.id}>
            <td><strong>{p.id}</strong></td>
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
    </div>
  );
}