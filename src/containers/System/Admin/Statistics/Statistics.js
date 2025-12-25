import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Line,
  Area,
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
      },
      timeSeries: [],
      bookingDetails: [],

      // UI State
      loading: false,
      clinics: [],
      specialties: [],
      // Pagination
      currentPage: 1,
      pageSize: 10,
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

      let bookingDetailsList = [];
      try {
        const bookingDetailsRes = await statisticService.getBookingDetails({
          ...params,
          limit: 50,
          offset: 0,
        });
        bookingDetailsList = bookingDetailsRes.data?.bookings || [];
      } catch (err) {
        console.error('Error fetching booking details:', err);
      }

      this.setState({
        kpi: kpiData,
        timeSeries: mergedTimeSeries,
        bookingDetails: bookingDetailsList,
        loading: false,
        currentPage: 1,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      this.setState({ loading: false });
    }
  };

  // Pagination helpers
  getPaginatedData = () => {
    const { bookingDetails, currentPage, pageSize } = this.state;
    const start = (currentPage - 1) * pageSize;
    return bookingDetails.slice(start, start + pageSize);
  };

  getTotalPages = () => {
    const { bookingDetails, pageSize } = this.state;
    const total = Math.ceil((bookingDetails?.length || 0) / pageSize);
    return Math.max(total, 1);
  };

  changePage = (newPage) => {
    const total = this.getTotalPages();
    if (newPage < 1 || newPage > total) return;
    this.setState({ currentPage: newPage });
  };

  nextPage = () => {
    this.changePage(this.state.currentPage + 1);
  };

  prevPage = () => {
    this.changePage(this.state.currentPage - 1);
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

  formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  render() {
    const {
      clinicId,
      specialtyId,
      kpi,
      timeSeries,
      bookingDetails,
      loading,
      clinics,
      specialties,
      startDate,
      endDate,
      currentPage,
      pageSize,
    } = this.state;

    const paginatedBookingDetails = this.getPaginatedData();
    const totalPages = this.getTotalPages();
    const baseIndex = (currentPage - 1) * pageSize;

    return (
      <div className="statistics-container">
        <div className="statistics-header">
          <h1>
            <i className="fas fa-chart-bar"></i> Dashboard Thống Kê Khám Bệnh
          </h1>
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
                <div className="kpi-icon">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <div className="kpi-content">
                  <div className="kpi-label">Tổng Lượt Khám</div>
                  <div className="kpi-value">
                    {this.formatNumber(kpi.totalBookings)}
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
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
                <h3>
                  <i className="fas fa-chart-line"></i> Lượt Khám & Doanh Thu
                  Theo Ngày
                </h3>
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

            {/* BOOKING DETAILS TABLE */}
            <div className="table-section">
              <h3>
                <i className="fas fa-list"></i> Chi Tiết Các Lượt Khám (
                {this.formatNumber(bookingDetails.length)} lượt)
              </h3>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Bệnh Nhân</th>
                    <th>SĐT</th>
                    <th>Bác Sĩ</th>
                    <th>Chuyên Khoa</th>
                    <th>Cơ Sở</th>
                    <th>Ngày Khám</th>
                    <th>Giờ Khám</th>
                    <th>Doanh Thu</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingDetails.length > 0 ? (
                    paginatedBookingDetails.map((booking, index) => (
                      <tr key={booking.id}>
                        <td>{baseIndex + index + 1}</td>
                        <td>{booking.patientName}</td>
                        <td>{booking.patientPhone}</td>
                        <td>{booking.doctorName}</td>
                        <td>{booking.specialty}</td>
                        <td>{booking.clinic}</td>
                        <td>{this.formatDateTime(booking.workDate)}</td>
                        <td>{booking.timeSlot}</td>
                        <td>{this.formatCurrency(booking.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center' }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="pagination-controls">
                <div className="pager">
                  <button className="pagination-btn" onClick={this.prevPage} disabled={currentPage <= 1}>
                    <i className="fas fa-chevron-left"></i>
                    <span className="btn-text">Trước</span>
                  </button>
                  <span className="page-info">
                    Trang {this.formatNumber(currentPage)} / {this.formatNumber(totalPages)}
                  </span>
                  <button className="pagination-btn" onClick={this.nextPage} disabled={currentPage >= totalPages}>
                    <span className="btn-text">Sau</span>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
             
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
