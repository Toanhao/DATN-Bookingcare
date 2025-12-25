/** @format */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import './BookingHistoryModal.scss';
import { Modal } from 'reactstrap';
import { getPatientBookingHistory, cancelPatientBooking, getBookingDetails } from '../../../services/userService';
import ExaminationDetailModal from '../../System/Doctor/ExaminationDetailModal';
import moment from 'moment';
import { toast } from 'react-toastify';

class BookingHistoryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookingHistory: [],
      filteredBookings: [],
      activeTab: 'upcoming',
      isLoading: false,
      showConfirmCancel: false,
      selectedBooking: null,
      showDetailModal: false,
      selectedBookingDetail: null,
    };
  }

  async componentDidMount() {
    await this.fetchBookingHistory();
  }

  async componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      await this.fetchBookingHistory();
    }
  }

  fetchBookingHistory = async () => {
    const { userInfo } = this.props;
    if (!userInfo || !userInfo.id) {
      toast.error('Vui lòng đăng nhập để xem lịch sử khám!');
      return;
    }

    this.setState({ isLoading: true });
    try {
      let res = await getPatientBookingHistory(userInfo.id);
      if (res) {
        this.setState({ bookingHistory: res }, () => {
          this.filterBookings(this.state.activeTab);
        });
      } else {
        toast.error('Lỗi khi tải lịch sử khám!');
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      toast.error('Lỗi khi tải lịch sử khám!');
    } finally {
      this.setState({ isLoading: false });
    }
  };

  filterBookings = (tab) => {
    const { bookingHistory } = this.state;
    let filtered = [];

    if (tab === 'upcoming') {
      // Chờ khám: CONFIRMED
      filtered = bookingHistory.filter((booking) => booking.status === 'CONFIRMED');
    } else if (tab === 'completed') {
      // Đã khám: DONE
      filtered = bookingHistory.filter((booking) => booking.status === 'DONE');
    } else if (tab === 'cancelled') {
      // Đã hủy: CANCELLED
      filtered = bookingHistory.filter((booking) => booking.status === 'CANCELLED');
    }

    // Sort by date descending
    filtered.sort((a, b) => {
      const dateA = moment(a.date, 'DD/MM/YYYY');
      const dateB = moment(b.date, 'DD/MM/YYYY');
      return dateB - dateA;
    });

    this.setState({ filteredBookings: filtered, activeTab: tab });
  };

  handleCancelBooking = (booking) => {
    this.setState({
      showConfirmCancel: true,
      selectedBooking: booking,
    });
  };

  confirmCancelBooking = async () => {
    const { selectedBooking } = this.state;
    const { userInfo } = this.props;

    if (!selectedBooking || !userInfo) return;

    try {
      let res = await cancelPatientBooking({
        bookingId: selectedBooking.id,
        patientId: userInfo.id,
      });

      if (res && res.errorCode === 0) {
        toast.success('Hủy lịch khám thành công!');
        this.setState({ showConfirmCancel: false, selectedBooking: null });
        await this.fetchBookingHistory();
      } else {
        toast.error(res.errMessage || 'Lỗi khi hủy lịch khám!');
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast.error('Lỗi khi hủy lịch khám!');
    }
  };

  closeConfirmModal = () => {
    this.setState({ showConfirmCancel: false, selectedBooking: null });
  };

  handleViewDetails = async (booking) => {
    try {
      // Lấy chi tiết đầy đủ của booking từ API
      let res = await getBookingDetails(booking.id);
      if (res && res.id) {
        this.setState({
          showDetailModal: true,
          selectedBookingDetail: res,
        });
      } else {
        toast.error('Lỗi khi tải chi tiết khám!');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Lỗi khi tải chi tiết khám!');
    }
  };

  closeDetailModal = () => {
    this.setState({
      showDetailModal: false,
      selectedBookingDetail: null,
    });
  };

  getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Chờ xác nhận email', className: 'status-pending' };
      case 'CONFIRMED':
        return { text: 'Chờ khám', className: 'status-confirmed' };
      case 'DONE':
        return { text: 'Đã khám xong', className: 'status-completed' };
      case 'CANCELLED':
        return { text: 'Đã hủy', className: 'status-cancelled' };
      default:
        return { text: 'Không xác định', className: '' };
    }
  };

  render() {
    const { isOpen, closeModal } = this.props;
    const { filteredBookings, activeTab, isLoading, showConfirmCancel, showDetailModal, selectedBookingDetail } = this.state;

    return (
      <>
        <Modal isOpen={isOpen} className="booking-history-modal" size="lg" centered>
          <div className="modal-header-custom">
            <h3>
              <i className="fas fa-history"></i> Lịch sử khám bệnh
            </h3>
            <button className="close-btn" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="modal-tabs">
            <button
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => this.filterBookings('upcoming')}
            >
              <i className="fas fa-calendar-check"></i> Chưa khám
            </button>
            <button
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => this.filterBookings('completed')}
            >
              <i className="fas fa-check-circle"></i> Đã khám
            </button>
            <button
              className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => this.filterBookings('cancelled')}
            >
              <i className="fas fa-times-circle"></i> Đã hủy
            </button>
          </div>

          <div className="modal-body-custom">
            {isLoading ? (
              <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i> Đang tải...
              </div>
            ) : filteredBookings && filteredBookings.length > 0 ? (
              <div className="booking-list">
                {filteredBookings.map((booking, index) => {
                  const status = this.getStatusText(booking.status);
                  const canCancel =
                    activeTab === 'upcoming' &&
                    booking.status === 'CONFIRMED';

                  return (
                    <div key={index} className="booking-item">
                      <div className="booking-header">
                        <div className="booking-date">
                          <i className="fas fa-calendar"></i>
                          <strong>
                            {booking.schedule && booking.schedule.workDate
                              ? moment(booking.schedule.workDate).format('DD/MM/YYYY')
                              : 'Chưa xác định'}
                          </strong>
                        </div>
                        <span className={`booking-status ${status.className}`}>
                          {status.text}
                        </span>
                      </div>

                      <div className="booking-details">
                        <div className="detail-row">
                          <i className="fas fa-user-md"></i>
                          <span>
                            <strong>Bác sĩ:</strong>{' '}
                            {booking.schedule && booking.schedule.doctor && booking.schedule.doctor.user
                              ? booking.schedule.doctor.user.fullName
                              : 'N/A'}
                          </span>
                        </div>

                        {booking.schedule && booking.schedule.timeSlot && (
                          <div className="detail-row">
                            <i className="fas fa-clock"></i>
                            <span>
                              <strong>Thời gian:</strong>{' '}
                              {booking.schedule.timeSlot.label}
                            </span>
                          </div>
                        )}

                        {booking.queueNumber && booking.schedule && booking.schedule.maxPatient && (
                          <div className="detail-row">
                            <i className="fas fa-sort-numeric-up"></i>
                            <span>
                              <strong>Số thứ tự:</strong>{' '}
                              {booking.queueNumber}/{booking.schedule.maxPatient}
                            </span>
                          </div>
                        )}

                        {activeTab === 'completed' &&
                          booking.schedule &&
                          booking.schedule.doctor &&
                          booking.schedule.doctor.fee !== undefined && (
                            <div className="detail-row">
                              <i className="fas fa-money-bill"></i>
                              <span>
                                <strong>Giá khám:</strong>{' '}
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                  Number(booking.schedule.doctor.fee) || 0
                                )}
                              </span>
                            </div>
                          )}

                        {booking.schedule && booking.schedule.doctor && booking.schedule.doctor.specialty && (
                            <div className="detail-row">
                              <i className="fas fa-stethoscope"></i>
                              <span>
                                <strong>Chuyên khoa:</strong>{' '}
                              {booking.schedule.doctor.specialty.name}
                              </span>
                            </div>
                          )}

                        {booking.schedule && booking.schedule.doctor && booking.schedule.doctor.clinic && (
                            <div className="detail-row">
                              <i className="fas fa-hospital"></i>
                              <span>
                                <strong>Phòng khám:</strong>{' '}
                              {booking.schedule.doctor.clinic.name}
                              </span>
                            </div>
                          )}
                      </div>

                      {canCancel && (
                        <div className="booking-actions">
                          <button
                            className="cancel-btn"
                            onClick={() => this.handleCancelBooking(booking)}
                          >
                            <i className="fas fa-times"></i> Hủy lịch khám
                          </button>
                        </div>
                      )}

                      {activeTab === 'completed' && (
                        <div className="booking-actions">
                          <button
                            className="detail-btn"
                            onClick={() => this.handleViewDetails(booking)}
                          >
                            <i className="fas fa-eye"></i> Xem chi tiết
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>Không có lịch khám nào</p>
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={showConfirmCancel}
          className="confirm-cancel-modal"
          centered
        >
          <div className="modal-header">
            <h5 className="modal-title">Xác nhận hủy lịch</h5>
            <button type="button" className="close" onClick={this.closeConfirmModal}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            Bạn có chắc chắn muốn hủy lịch khám này không?
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={this.closeConfirmModal}>
              Đóng
            </button>
            <button type="button" className="btn btn-danger" onClick={this.confirmCancelBooking}>
              Hủy lịch khám
            </button>
          </div>
        </Modal>

        <ExaminationDetailModal
          isOpen={showDetailModal}
          onClose={this.closeDetailModal}
          bookingDetail={selectedBookingDetail}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    userInfo: state.user.userInfo,
  };
};

export default connect(mapStateToProps)(BookingHistoryModal);
