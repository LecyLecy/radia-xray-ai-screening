export const mockPatients = [
  { id: "P001", name: "Andi Wijaya", email: "andi@mail.com", phone: "08123456789", dob: "1990-05-14", gender: "Male" },
  { id: "P002", name: "Siti Rahma", email: "siti@mail.com", phone: "08987654321", dob: "1985-11-22", gender: "Female" },
  { id: "P003", name: "Budi Santoso", email: "budi@mail.com", phone: "08556677889", dob: "2002-01-08", gender: "Male" }
];

export const mockDoctors = [
  { id: "D001", name: "Dr. Hendra Kurniawan, Sp.Rad", email: "hendra@radia.com" }
];

export const mockExaminations = [
  {
    id: "EX001",
    patientId: "P001",
    patientName: "Andi Wijaya",
    date: "2026-05-18",
    doctorName: "Dr. Hendra Kurniawan, Sp.Rad",
    predictionResult: "Pneumonia",
    confidenceScore: 94.2,
    status: "Report Ready",
    doctorNote: "Bercak infiltrat terlihat jelas di lobus kanan bawah. Disarankan terapi antibiotik agresif.",
    xrayUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "EX002",
    patientId: "P001",
    patientName: "Andi Wijaya",
    date: "2026-05-20",
    doctorName: "Dr. Hendra Kurniawan, Sp.Rad",
    predictionResult: "Normal",
    confidenceScore: 98.7,
    status: "Pending Review",
    doctorNote: "",
    xrayUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "EX003",
    patientId: "P002",
    patientName: "Siti Rahma",
    date: "2026-05-15",
    doctorName: "Dr. Hendra Kurniawan, Sp.Rad",
    predictionResult: "Pneumonia",
    confidenceScore: 87.5,
    status: "Reviewed",
    doctorNote: "Infiltrat ringan, observasi berkala seminggu lagi.",
    xrayUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=600&auto=format&fit=crop"
  }
];