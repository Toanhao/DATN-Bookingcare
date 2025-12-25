import React, { Component } from 'react';
import { connect } from 'react-redux';
import { statisticService } from '../../../../services';
import DatePicker from '../../../../components/Input/DatePicker';
import './Statistics.scss';

class DoctorStatistic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clinicId: null,
      specialtyId: null,
      startDate: this.getDateOffset(30),
      endDate: new Date(),
      topDoctors: [],
      totalRevenue: 0,
      loading: false,
      clinics: [],
      specialties: [],
    };
  }

  componentDidMount() {
    this.fetchData();
    this.fetchFilterOptions();
  }

  getDateOffset = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d;
  };

  formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  fetchFilterOptions = async () => {
    try {
      const clinicsRes = await statisticService.getClinics();
      const specialtiesRes = await statisticService.getSpecialties();

      this.setState({
        clinics: clinicsRes.data || [],
        specialties: specialtiesRes.data || [],
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  getDateRange = () => {
    const { startDate, endDate } = this.state;
    return { from: this.formatDate(startDate), to: this.formatDate(endDate) };
  };

  fetchData = async () => {
    this.setState({ loading: true });
    try {
      const { clinicId, specialtyId } = this.state;
      const { from, to } = this.getDateRange();

      const params = {
        from,
        to,
        ...(clinicId && { clinicId }),
        ...(specialtyId && { specialtyId }),
      };

      const doctorsRes = await statisticService.getTopDoctors(params);
      const kpiRes = await statisticService.getDashboardKPI(params);

      this.setState({
        topDoctors: doctorsRes.data || [],
        totalRevenue: kpiRes.data?.totalRevenue || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      this.setState({ loading: false });
    }
  };

  handleFilterChange = (filterName, value) => {
    this.setState({ [filterName]: value }, this.fetchData);
  };

  handleDateChange = (field, dateArr) => {
    if (!Array.isArray(dateArr) || dateArr.length === 0) return;
    this.setState({ [field]: dateArr[0] });
  };

  applyFilters = () => {
    const { startDate, endDate } = this.state;
    if (!startDate || !endDate) return;
    if (new Date(startDate) > new Date(endDate)) return;
    this.fetchData();
  };

  formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  render() {
    const {
      clinicId,
      specialtyId,
      topDoctors,
      totalRevenue,
      loading,
      clinics,
      specialties,
      startDate,
      endDate,
    } = this.state;

    return (
      <div className="statistics-container">
        <div className="statistics-header">
          <h1><i className="fas fa-user-md"></i> Thống Kê Bác Sĩ</h1>
        </div>

        {/* FILTER BAR */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>Cơ sở y tế:</label>
            <select
              value={clinicId || ''}
              onChange={(e) =>
                this.handleFilterChange(
                  'clinicId',
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
            >
              <option value="">Tất cả cơ sở</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Chuyên khoa:</label>
            <select
              value={specialtyId || ''}
              onChange={(e) =>
                this.handleFilterChange(
                  'specialtyId',
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
            >
              <option value="">Tất cả chuyên khoa</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group date-range">
            <label>Khoảng thời gian:</label>
            <div className="date-inputs">
              <div className="date-field">
                <span>Từ</span>
                <DatePicker
                  onChange={(date) => this.handleDateChange('startDate', date)}
                  className="form-control"
                  value={startDate}
                />
              </div>
              <div className="date-field">
                <span>Đến</span>
                <DatePicker
                  onChange={(date) => this.handleDateChange('endDate', date)}
                  className="form-control"
                  value={endDate}
                />
              </div>
              <button className="apply-btn" onClick={this.applyFilters}>
                Xem
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : (
          <div className="table-section">
            <h3><i className="fas fa-user-md"></i> Top 10 Bác Sĩ</h3>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên Bác Sĩ</th>
                  <th>Chuyên Khoa</th>
                  <th>Cơ Sở</th>
                  <th>Lượt Khám</th>
                  <th>Doanh Thu</th>
                </tr>
              </thead>
              <tbody>
                {topDoctors.length > 0 ? (
                  topDoctors.map((doctor, index) => (
                    <tr key={doctor.doctorId}>
                      <td>{index + 1}</td>
                      <td>{doctor.doctorName}</td>
                      <td>{doctor.specialty}</td>
                      <td>{doctor.clinic}</td>
                      <td>{this.formatNumber(doctor.bookingCount)}</td>
                      <td>{this.formatCurrency(doctor.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DoctorStatistic);
