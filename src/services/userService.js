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
  return axios.get(`/api/get-all-users?id=${inputId}`);
};

const createNewUserService = (data) => {
  console.log('check data from service: ', data);
  return axios.post(`/api/users/register`, data);
};

const deleteUserService = (userId) => {
  return axios.delete('/api/delete-user/', {
    data: {
      id: userId,
    },
  });
};

const editUserService = (inputData) => {
  return axios.put('/api/edit-user', inputData);
};

// Legacy allcode removed in new backend; use specific resources instead

// TimeSlots
export const getTimeSlots = () => {
  return axios.get('/api/time-slots');
};

export const createScheduleBulkNew = (data) => {
  return axios.post('/api/schedules/bulk', data);
};

const getTopDoctorHomeService = (limit) => {
  return axios.get(`/api/top-doctor-home?limit=${limit}`);
};

const getAllDoctors = () => {
  return axios.get(`/api/get-all-doctors`);
};

const saveDetailDoctorService = (data) => {
  return axios.post(`/api/save-Info-doctor`, data);
};

const getDetailInforDoctor = (inputId) => {
  return axios.get(`/api/get-detail-doctor-by-id?id=${inputId}`);
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
  return axios.get(`/api/get-extra-Info-doctor-by-id?doctorId=${doctorId}`);
};

const getProfileDoctorById = (doctorId) => {
  return axios.get(`/api/get-profile-doctor-by-id?doctorId=${doctorId}`);
};

const postPatientBookAppointment = (data) => {
  return axios.post('/api/patient-book-appointment', data);
};

const postVerifyBookAppointment = (data) => {
  return axios.post('/api/verify-book-appointment', data);
};

const createNewSpecialty = (data) => {
  return axios.post('/api/create-new-specialty', data);
};

const getAllSpecialty = () => {
  return axios.get('api/get-all-specialty');
};

const getAllDetailSpecialtyById = (data) => {
  return axios.get(
    `api/get-detail-specialty-by-id?id=${data.id}&location=${data.location}`
  );
};

const createNewClinic = (data) => {
  return axios.post('/api/create-new-clinic', data);
};

const getAllClinic = () => {
  return axios.get('api/get-all-clinic');
};

const createNewHandbook = (data) => {
  return axios.post('/api/create-new-handbook', data);
};

const getAllHandbook = () => {
  return axios.get('api/get-all-handbook');
};

const getDetailHandbookById = (id) => {
  return axios.get(`api/get-detail-handbook-by-id?id=${id}`);
};

const getAllDetailClinicById = (data) => {
  return axios.get(`api/get-detail-clinic-by-id?id=${data.id}`);
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
