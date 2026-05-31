
**# Problem Planning

# Theme

Health / Healthcare Support System

# Problem Scenario

Di fasilitas kesehatan dengan sumber daya terbatas, proses pemeriksaan chest X-Ray masih dapat mengalami hambatan karena hasil pemeriksaan perlu ditinjau oleh tenaga medis yang memiliki kompetensi membaca citra radiologi. Ketika jumlah tenaga ahli terbatas, dokter umum atau tenaga kesehatan sering perlu melakukan penilaian awal sambil menangani banyak pasien lain. Kondisi ini dapat menyebabkan keterlambatan screening, dokumentasi hasil yang tidak seragam, dan risiko berkurangnya konsistensi dalam pengambilan keputusan awal.

# Focus

* software pendukung proses pemeriksaan X-Ray di fasilitas kesehatan terbatas, dengan AI sebagai fitur second opinion.
* Bagaimana membantu tenaga kesehatan mengelola proses pemeriksaan chest X-Ray secara lebih terstruktur, cepat, terdokumentasi, dan didukung oleh AI sebagai second opinion tanpa menggantikan keputusan dokter.

# User

* Dokter umum / tenaga kesehatan klinik
  * Can:
  * melihat data pasien
  * mengunggah X-Ray
  * mendapat bantuan interpretasi awal
  * menyimpan hasil pemeriksaan
  * membuat laporan untuk pasien
    * Contoh (Generated Automatically)

![]()

* memberi validasi terhadap hasil AI
* Infomation Needed:

  * Full name
  * Email
  * Phone number
  * Profile picture
  * Medical role / specialization
  * License number / doctor ID, optiona
* Admin klinik / petugas fasilitas kesehatan
* Can:
* mengelola data pasien
* melihat daftar pemeriksaan
* membantu pencetakan laporan
* mengecek riwayat pemeriksaan
* Pasien
* Can:
* pasien bisa menerima PDF/print report
* riwayat pemeriksaan
* Infomation Needed:
* Full name
* Email
* Phone number
* Profile picture
* Gender, optional
* Date of birth -> Age

# Software Usage

* Sistem manajemen pemeriksaan X-Ray

  * data pasien
  * tanggal pemeriksaan
  * gambar X-Ray
  * hasil prediksi AI
  * catatan dokter
  * feedback dokter
  * report pemeriksaan
* Clinical decision support / second opinion
* prediksi Normal / Pneumonia
* confidence score
* Grad-CAM / visual explanation jika tersedia
* Report generator
* laporan hasil pemeriksaan
* data pasien
* diagnosis final dokter
* catatan final dokter
* disclaimer
* tanggal pemeriksaan
* Riwayat pemeriksaan pasien
* pasien pernah diperiksa kapan
* hasil sebelumnya apa
* apakah ada follow-up
* catatan dokter sebelumnya
* Feedback logging untuk pengembangan AI
* AI prediction correct
* AI prediction incorrect
* Uncertain

# Batasan Problem

**	**Supaya project tidak kebesaran, kita perlu tulis batasannya dari awal.

* Yang diselesaikan
  * dokumentasi pemeriksaan X-Ray
  * upload dan analisis X-Ray
  * AI second opinion
  * report generation
  * riwayat pemeriksaan
  * feedback dokter
* Yang tidak diselesaikan
* menggantikan dokter
* memberi diagnosis final otomatis
* terhubung langsung ke sistem rumah sakit asli
* melakukan retraining model otomatis
* menangani semua penyakit paru-paru secara lengkap
* mengatur antrean rumah sakit secara real-time
* menyimpan data medis skala nasional

# MVP Scope

* Must Have:

1. Role-based login

   - Patient
   - Doctor
   - Admin
2. Patient profile

   - name
   - email
   - phone number
   - profile picture
   - Age
   - Gender
3. Doctor profile

   - name
   - email
   - phone number
   - profile picture
   - doctor identifier / role
   - Age
   - Gender
4. Admin account

   - basic account only, no detailed profile required
5. Patient management

   - create patient
   - edit patient
   - view patient detail
6. X-Ray examination record

   - search registered patient by email
   - select/extract doctor from logged-in doctor
   - upload X-Ray
   - save symptoms and preliminary solution
   - save examination date
7. AI-assisted prediction

   - Normal / Pneumonia
   - confidence score
   - Grad-CAM if feasible
8. Doctor validation

   - final doctor note
   - final diagnosis
   - AI result marked as correct / incorrect / uncertain
9. Examination history

   - doctor/admin can view patient history
   - patient can view only their own history
10. PDF report

- patient data
- doctor data
- examination date
- final diagnosis
- final doctor note
- disclaimer

* Should Have:

1. Patient can download PDF report from their portal
2. Doctor can regenerate report
3. Upload validation for JPG/PNG
4. Basic search/filter patient by name/email
5. Profile picture upload

* Could Have:

1. Email notification when report is ready
2. Follow-up examination date
3. Admin audit log
4. Simple status label: not ready / ready
5. Basic dashboard cards, not statistics-heavy

* Won’t Have:

1. Full hospital information system integration
2. Real-time appointment queue
3. Automatic final medical diagnosis
4. Automatic model retraining
5. Payment system
6. Pharmacy/medicine recommendation
7. Complex analytics/statistics dashboard

# Scope Boundary

* In Scope

1. Role-based authentication

   - Patient register/login
   - Doctor login
   - Admin login
2. Patient profile

   - full name
   - email
   - phone number
   - age
   - gender
   - profile picture
3. Doctor profile

   - full name
   - email
   - phone number
   - age
   - gender
   - profile picture
   - doctor identifier/license number
   - specialization/role
4. Admin account

   - full name
   - email
   - password
   - role
5. Patient portal

   - view own profile
   - edit profile picture
   - view own examination history
   - download own PDF reports
6. Doctor workspace

   - search registered patients by email
   - create doctor-owned examination records
   - upload chest X-Ray
   - run AI-assisted pneumonia screening
   - view AI prediction and confidence score
   - view Grad-CAM if feasible
   - add doctor note
   - validate AI prediction
   - generate PDF report
7. Admin workspace

   - full system access
   - manage patient data
   - manage doctor data
   - manage examinations
   - upload X-Ray
   - run AI prediction
   - generate/download reports
8. Examination history

   - patient-specific history
   - doctor/admin access to relevant records
9. PDF report generation

   - patient information
   - doctor information
   - examination date
   - final diagnosis
   - final doctor note
   - disclaimer

* Out of Scope

1. Automatic final medical diagnosis
2. Replacement of doctors/radiologists
3. Real hospital system integration
4. Real-time queue management
5. Appointment scheduling
6. Payment or insurance
7. Medication recommendation
8. Automatic model retraining
9. Reinforcement learning in production
10. Complex statistics dashboard
11. Mobile application
12. Multi-clinic enterprise deployment

# Role Permission Matrix

| Feature / Action                 | Patient                | Doctor            | Admin    |
| -------------------------------- | ---------------------- | ----------------- | -------- |
| Register own account             | Yes                    | No                | No       |
| Login                            | Yes                    | Yes               | Yes      |
| View own profile                 | Yes                    | Yes               | Basic    |
| Edit own profile picture         | No                     | No                | No       |
| Edit own identity data           | No                     | No                | No       |
| View all patients                | No                     | Yes               | Yes      |
| View own examination history     | Yes                    | No                | No       |
| View patient examination history | No                     | Yes               | Yes      |
| Create patient account           | Patient self-registers | Optional          | Yes      |
| Edit patient data                | No                     | Optional          | Yes      |
| Promote patient to doctor        | No                     | No                | Yes      |
| Edit doctor data                 | No                     | No                | Yes      |
| Create examination record        | No                     | Yes               | Yes      |
| Upload X-Ray                     | No                     | Yes               | Yes      |
| Run AI prediction                | No                     | Yes               | Yes      |
| View own AI result               | No                     | No                | No       |
| View patient AI result           | No                     | Yes               | Yes      |
| Add doctor note                  | No                     | Yes               | Yes      |
| Validate AI prediction           | No                     | Yes               | Yes      |
| Generate PDF report              | No                     | Yes               | Yes      |
| Download own PDF report          | Yes                    | No                | No       |
| Download patient PDF report      | No                     | Yes               | Yes      |
| Manage users                     | No                     | No                | Yes      |
| Delete records                   | No                     | No/Optional       | Yes      |

**
