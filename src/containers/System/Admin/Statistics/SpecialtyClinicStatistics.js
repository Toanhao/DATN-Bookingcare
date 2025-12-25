import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { statisticService } from '../../../../services';
import DatePicker from '../../../../components/Input/DatePicker';
import './Statistics.scss';

class SpecialtyClinicStatistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: this.getDateOffset(30),
      endDate: new Date(),
      clinicsStats: [],
      specialtiesStats: [],
      loading: false,
      activeTab: 'clinics',
    };
  }

  componentDidMount() {
    this.fetchData();
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

  getDateRange = () => {
    const { startDate, endDate } = this.state;
    return { from: this.formatDate(startDate), to: this.formatDate(endDate) };
  };

  fetchData = async () => {
    this.setState({ loading: true });
    try {
      const { from, to } = this.getDateRange();
      const params = { from, to };

      const clinicsRes = await statisticService.getClinicStats(params);
      const specialtiesRes = await statisticService.getSpecialtyStats(params);

      this.setState({
        clinicsStats: clinicsRes.data || [],
        specialtiesStats: specialtiesRes.data || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      this.setState({ loading: false });
    }
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

  render() {
    const {
      clinicsStats,
      specialtiesStats,
      loading,
      activeTab,
      startDate,
      endDate,
    } = this.state;

    return (
      <div className="statistics-container">
        <div className="statistics-header">
          <h1><i className="fas fa-hospital"></i> Thống Kê Chuyên Khoa & Cơ Sở</h1>
        </div>

        {/* FILTER BAR */}
        <div className="filter-bar">
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
          <div className="comparison-section">
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'clinics' ? 'active' : ''}`}
                onClick={() => this.setState({ activeTab: 'clinics' })}
              >
                <i className="fas fa-hospital"></i> So Sánh Cơ Sở
              </button>
              <button
                className={`tab-btn ${activeTab === 'specialties' ? 'active' : ''}`}
                onClick={() => this.setState({ activeTab: 'specialties' })}
              >
                <i className="fas fa-stethoscope"></i> So Sánh Chuyên Khoa
              </button>
            </div>

            {activeTab === 'clinics' && (
              <div className="chart-card">
                <h3>So Sánh Doanh Thu Theo Cơ Sở</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={clinicsStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis xAxisId="revenue" type="number" orientation="top" />
                    <XAxis xAxisId="bookings" type="number" orientation="bottom" />
                    <YAxis dataKey="clinicName" type="category" width={250} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      xAxisId="revenue"
                      dataKey="revenue"
                      fill="#8884d8"
                      name="Doanh Thu (VNĐ)"
                    />
                    <Bar
                      xAxisId="bookings"
                      dataKey="bookingCount"
                      fill="#82ca9d"
                      name="Lượt Khám"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'specialties' && (
              <div className="chart-card">
                <h3>So Sánh Doanh Thu Theo Chuyên Khoa</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={specialtiesStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis xAxisId="revenue" type="number" orientation="top" />
                    <XAxis xAxisId="bookings" type="number" orientation="bottom" />
                    <YAxis dataKey="specialtyName" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      xAxisId="revenue"
                      dataKey="revenue"
                      fill="#8884d8"
                      name="Doanh Thu (VNĐ)"
                    />
                    <Bar
                      xAxisId="bookings"
                      dataKey="bookingCount"
                      fill="#82ca9d"
                      name="Lượt Khám"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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

export default connect(mapStateToProps, mapDispatchToProps)(SpecialtyClinicStatistics);
