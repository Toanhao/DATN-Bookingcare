/** @format */

import axios from '../axios';

const handleLoginApi = (userEmail, userPassword) => {
  return axios.post('/api/users/login', {
    email: userEmail,
    password: userPassword,
  });
};

const getAllUsers = (inputId) => {
  //template String
  return axios.get(`/api/users`);
};

const createNewUserService = (data) => {
  console.log('check data from service: ', data);
  return axios.post(`/api/users/create`, data); // Admin tạo user với role tùy chỉnh
};

const deleteUserService = (userId) => {
  return axios.delete(`/api/users/${userId}`);
};

const editUserService = (inputData) => {
  return axios.put(`/api/users/${inputData.id}`, inputData);
};

// Legacy allcode removed in new backend; use specific resources instead

// TimeSlots
export const getTimeSlots = () => {
  return axios.get('/api/time-slots');
};

export const createScheduleBulkNew = (data) => {
  return axios.post('/api/schedules/bulk', data);
};

// New schedules fetcher for a doctor by date (YYYY-MM-DD)
export const getSchedules = (doctorId, workDate) => {
  return axios.get('/api/schedules', {
    params: { doctorId, workDate },
  });
};

const getTopDoctorHomeService = (limit) => {
  return axios.get(`/api/top-doctor-home?limit=${limit}`);
};

const getAllDoctors = () => {
  return axios.get(`/api/doctors`);
};

const getAllDoctorsUser = () => {
  return axios.get(`/api/users/getAllDoctors`);
};

const saveDetailDoctorService = (data) => {
  if (data.action === 'CREATE') {
    return axios.post(`/api/doctors`, data);
  } else {
    const doctorId = data.id;
    return axios.patch(`/api/doctors/${doctorId}`, data);
  }
};

const getDetailInforDoctor = (inputId) => {
  return axios.get(`/api/doctors/${inputId}`);
};

const saveBulkScheduleDoctor = (data) => {
  return axios.post(`/api/bulk-create-schedule`, data);
};

const getScheduleDoctorByDate = (doctorId, date) => {
  return axios.get(
    `/api/get-schedule-doctor-by-date?doctorId=${doctorId}&date=${date}`
  );
};

const getExtraInforDoctorById = (doctorId) => {
  return axios.get(`/api/doctors/${doctorId}`);
};

const getProfileDoctorById = (doctorId) => {
  return axios.get(`/api/doctors/${doctorId}`);
};

const postPatientBookAppointment = (data) => {
  return axios.post('/api/patient-book-appointment', data);
};

const postVerifyBookAppointment = (data) => {
  return axios.post('/api/verify-book-appointment', data);
};

const createNewSpecialty = (data) => {
  return axios.post('/api/specialties', data);
};

const getAllSpecialty = () => {
  return axios.get('/api/specialties');
};

const getAllDetailSpecialtyById = (data) => {
  return axios.get(`/api/specialties/${data.id}`);
};

const createNewClinic = (data) => {
  return axios.post('/api/clinics', data);
};

const getAllClinic = () => {
  return axios.get('/api/clinics');
};

const getAllDetailClinicById = (id) => {
  return axios.get(`/api/clinics/${id}`);
};

const createNewHandbook = (data) => {
  return axios.post('/api/handbooks', data);
};

const getAllHandbook = () => {
  return axios.get('/api/handbooks');
};

const getDetailHandbookById = (id) => {
  return axios.get(`/api/handbooks/${id}`);
};

const getAllPatientForDoctor = (data) => {
  return axios.get(
    `/api/get-list-patient-for-doctor?doctorId=${data.doctorId}&date=${data.date}`
  );
};

const postSendRemedy = (data) => {
  return axios.post('/api/send-remedy', data);
};

const getPatientBookingHistory = (patientId) => {
  return axios.get(`/api/get-patient-booking-history?patientId=${patientId}`);
};

const cancelPatientBooking = (data) => {
  return axios.post('/api/cancel-patient-booking', data);
};

export {
  handleLoginApi,
  getAllUsers,
  createNewUserService,
  deleteUserService,
  editUserService,
  getTopDoctorHomeService,
  getAllDoctors,
  getAllDoctorsUser,
  saveDetailDoctorService,
  getDetailInforDoctor,
  saveBulkScheduleDoctor,
  getScheduleDoctorByDate,
  getExtraInforDoctorById,
  getProfileDoctorById,
  postPatientBookAppointment,
  postVerifyBookAppointment,
  createNewSpecialty,
  getAllSpecialty,
  createNewHandbook,
  getAllHandbook,
  getDetailHandbookById,
  getAllDetailSpecialtyById,
  createNewClinic,
  getAllClinic,
  getAllDetailClinicById,
  getAllPatientForDoctor,
  postSendRemedy,
  getPatientBookingHistory,
  cancelPatientBooking,
};
