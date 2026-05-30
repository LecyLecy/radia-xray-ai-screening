import api, { getApiErrorMessage } from './api';

export const getAllPatients = async () => {
  try {
    const response = await api.get('/doctor/patients');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load patients.'), { cause: error });
  }
};

export const getDoctorPatient = async (patientId) => {
  try {
    const response = await api.get(`/doctor/patients/${patientId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load patient detail.'), { cause: error });
  }
};

export const createExamination = async (patientId) => {
  try {
    const response = await api.post('/doctor/examinations', { patient_id: patientId });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create examination.'), { cause: error });
  }
};

export const predictExamination = async (examinationId, xrayImage) => {
  try {
    const formData = new FormData();
    formData.append('xray_image', xrayImage);

    const response = await api.post(
      `/doctor/examinations/${examinationId}/predict`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to run AI prediction.'), { cause: error });
  }
};

export const updateDoctorNote = async (examinationId, doctorNote) => {
  try {
    const response = await api.patch(`/doctor/examinations/${examinationId}/note`, {
      doctor_note: doctorNote,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to save doctor note.'), { cause: error });
  }
};

export const saveDoctorFeedback = async (examinationId, feedbackStatus, feedbackNote) => {
  try {
    const response = await api.patch(`/doctor/examinations/${examinationId}/feedback`, {
      feedback_status: feedbackStatus,
      feedback_note: feedbackNote,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to save doctor feedback.'), { cause: error });
  }
};

export const generateReport = async (examinationId) => {
  try {
    const response = await api.post(`/doctor/examinations/${examinationId}/report`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to generate report.'), { cause: error });
  }
};

export const getMyExaminations = async () => {
  try {
    const response = await api.get('/patients/me/examinations');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load examination history.'), { cause: error });
  }
};

export const getMyExaminationDetail = async (examinationId) => {
  try {
    const response = await api.get(`/patients/me/examinations/${examinationId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load examination detail.'), { cause: error });
  }
};

export const getReportDownload = async (reportId) => {
  try {
    const response = await api.get(`/reports/${reportId}/download`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to get report download link.'), { cause: error });
  }
};
