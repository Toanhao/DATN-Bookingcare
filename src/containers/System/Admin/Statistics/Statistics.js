import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Line,
  Bar,
  Area,
  BarChart,
  ComposedChart,
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

class Statistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Filters
      clinicId: null,
      specialtyId: null,
      startDate: this.getDateOffset(30),
      endDate: new Date(),

      // Data
      kpi: {
        totalBookings: 0,
        totalRevenue: 0,
        todayBookings: 0,
        todayRevenue: 0,
      },
      timeSeries: [],
      topDoctors: [],
      clinicsStats: [],
      specialtiesStats: [],

      // UI State
      loading: false,
      activeTab: 'clinics', // 'clinics' or 'specialties'
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
    // Format theo local date, không UTC
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

      // Lấy KPI
      const kpiRes = await statisticService.getDashboardKPI(params);
      const kpiData = kpiRes.data || this.state.kpi;

      // Lấy Time Series
      const bookingsRes = await statisticService.getTimeSeries(
        params,
        'bookings'
      );
      const revenueRes = await statisticService.getTimeSeries(
        params,
        'revenue'
      );

      const bookingsData = bookingsRes.data || [];
      const revenueData = revenueRes.data || [];
      const mergedTimeSeries = this.mergeTimeSeriesData(
        bookingsData,
        revenueData
      );

      // Lấy thống kê
      const doctorsRes = await statisticService.getTopDoctors(params);
      const clinicsRes = await statisticService.getClinicStats(params);
      const specialtiesRes = await statisticService.getSpecialtyStats(params);

      this.setState({
        kpi: kpiData,
        timeSeries: mergedTimeSeries,
        topDoctors: doctorsRes.data || [],
        clinicsStats: clinicsRes.data || [],
        specialtiesStats: specialtiesRes.data || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      this.setState({ loading: false });
    }
  };

  mergeTimeSeriesData = (bookings, revenue) => {
    const map = {};

    bookings.forEach((item) => {
      if (!map[item.date]) map[item.date] = { date: item.date };
      map[item.date].bookings = parseInt(item.count) || 0;
    });

    revenue.forEach((item) => {
      if (!map[item.date]) map[item.date] = { date: item.date };
      map[item.date].revenue = parseFloat(item.revenue) || 0;
    });

    return Object.values(map).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
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
      kpi,
      timeSeries,
      topDoctors,
      clinicsStats,
      specialtiesStats,
      loading,
      activeTab,
      clinics,
      specialties,
      startDate,
      endDate,
    } = this.state;

    return (
      <div className="statistics-container">
        <div className="statistics-header">
          <h1><i className="fas fa-chart-bar"></i> Dashboard Thống Kê Khám Bệnh</h1>
        </div>

        {/* TODAY SUMMARY */}
        <div className="today-summary">
          <div className="summary-card">
            <div className="summary-icon"><i className="fas fa-calendar-check"></i></div>
            <div>
              <div className="summary-label">Lượt khám hôm nay</div>
              <div className="summary-value">
                {this.formatNumber(kpi.todayBookings)}
              </div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon"><i className="fas fa-dollar-sign"></i></div>
            <div>
              <div className="summary-label">Doanh thu hôm nay</div>
              <div className="summary-value">
                {this.formatCurrency(kpi.todayRevenue)}
              </div>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="filter-bar sticky">
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
          <>
            {/* KPI CARDS (theo khoảng thời gian lọc) */}
            <div className="kpi-section">
              <div className="kpi-card">
                <div className="kpi-icon"><i className="fas fa-clipboard-list"></i></div>
                <div className="kpi-content">
                  <div className="kpi-label">Tổng Lượt Khám</div>
                  <div className="kpi-value">
                    {this.formatNumber(kpi.totalBookings)}
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon"><i className="fas fa-money-bill-wave"></i></div>
                <div className="kpi-content">
                  <div className="kpi-label">Tổng Doanh Thu</div>
                  <div className="kpi-value">
                    {this.formatCurrency(kpi.totalRevenue)}
                  </div>
                </div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="charts-section">
              <div className="chart-card">
                <h3><i className="fas fa-chart-line"></i> Lượt Khám & Doanh Thu Theo Ngày</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      yAxisId="left"
                      label={{
                        value: 'Lượt khám',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{
                        value: 'Doanh thu (VNĐ)',
                        angle: 90,
                        position: 'insideRight',
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="bookings"
                      stroke="#8884d8"
                      name="Lượt khám"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      fill="#82ca9d"
                      stroke="#82ca9d"
                      name="Doanh thu"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TOP DOCTORS */}
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
                    <th>% Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {topDoctors.map((doctor, index) => (
                    <tr key={doctor.doctorId}>
                      <td>{index + 1}</td>
                      <td>{doctor.doctorName}</td>
                      <td>{doctor.specialty}</td>
                      <td>{doctor.clinic}</td>
                      <td>{this.formatNumber(doctor.bookingCount)}</td>
                      <td>{this.formatCurrency(doctor.revenue)}</td>
                      <td>
                        {(
                          (kpi.totalRevenue > 0
                            ? (doctor.revenue / kpi.totalRevenue) * 100
                            : 0) || 0
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CLINIC & SPECIALTY COMPARISON */}
            <div className="comparison-section">
              <div className="tabs">
                <button
                  className={`tab-btn ${
                    activeTab === 'clinics' ? 'active' : ''
                  }`}
                  onClick={() => this.setState({ activeTab: 'clinics' })}
                >
                  <i className="fas fa-hospital"></i> So Sánh Cơ Sở
                </button>
                <button
                  className={`tab-btn ${
                    activeTab === 'specialties' ? 'active' : ''
                  }`}
                  onClick={() => this.setState({ activeTab: 'specialties' })}
                >
                  <i className="fas fa-stethoscope"></i> So Sánh Chuyên Khoa
                </button>
              </div>

              {activeTab === 'clinics' && (
                <div className="chart-card">
                  <h3>So Sánh Doanh Thu Theo Cơ Sở</h3>
                  <ResponsiveContainer width="100%" height={300}>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={specialtiesStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis xAxisId="revenue" type="number" orientation="top" />
                      <XAxis xAxisId="bookings" type="number" orientation="bottom" />
                      <YAxis
                        dataKey="specialtyName"
                        type="category"
                        width={150}
                      />
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
          </>
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

export default connect(mapStateToProps, mapDispatchToProps)(Statistics);
