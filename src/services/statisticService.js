import axios from '../axios';

const statisticService = {
  /**
   * Lấy danh sách cơ sở y tế
   */
  getClinics() {
    return axios.get('/api/clinics');
  },

  /**
   * Lấy danh sách chuyên khoa
   */
  getSpecialties() {
    return axios.get('/api/specialties');
  },

  /**
   * Lấy dữ liệu dashboard (KPI)
   */
  getDashboardKPI(params) {
    return axios.get('/api/statistics/dashboard', { params });
  },

  /**
   * Lấy dữ liệu time series (bookings & revenue)
   */
  getTimeSeries(params) {
    return axios.get('/api/statistics/time-series', { params });
  },

  /**
   * Lấy thống kê bác sĩ
   */
  getTopDoctors(params) {
    return axios.get('/api/statistics/doctors', { params });
  },

  /**
   * Lấy thống kê cơ sở y tế
   */
  getClinicStats(params) {
    return axios.get('/api/statistics/clinics', { params });
  },

  /**
   * Lấy thống kê chuyên khoa
   */
  getSpecialtyStats(params) {
    return axios.get('/api/statistics/specialties', { params });
  },

  /**
   * Lấy danh sách chi tiết các lượt khám
   */
  getBookingDetails(params) {
    return axios.get('/api/statistics/bookings', { params });
  },
};

export default statisticService;
