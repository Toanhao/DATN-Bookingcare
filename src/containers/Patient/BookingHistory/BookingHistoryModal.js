/** @format */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import './BookingHistoryModal.scss';
import { Modal } from 'reactstrap';
import { getPatientBookingHistory, cancelPatientBooking } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import moment from 'moment';
import { toast } from 'react-toastify';

class BookingHistoryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookingHistory: [],
      filteredBookings: [],
      activeTab: 'upcoming', // upcoming, completed, cancelled
      isLoading: false,
      showConfirmCancel: false,
      selectedBooking: null,
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
      // toast.error('Vui lòng đăng nhập để xem lịch sử khám!');
      return;
    }

    this.setState({ isLoading: true });
    try {
      let res = await getPatientBookingHistory(userInfo.id);
      if (res && res.errCode === 0) {
        this.setState({ bookingHistory: res.data }, () => {
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

    const today = moment().startOf('day');

    if (tab === 'upcoming') {
      // Chưa khám: chỉ S2 (đã xác nhận email, chờ khám)
      filtered = bookingHistory.filter((booking) => {
        return booking.statusId === 'S2';
      });
    } else if (tab === 'completed') {
      // Đã khám: chỉ S3 (đã khám xong)
      filtered = bookingHistory.filter((booking) => {
        return booking.statusId === 'S3';
      });
    } else if (tab === 'cancelled') {
      // Đã hủy: S4
      filtered = bookingHistory.filter((booking) => booking.statusId === 'S4');
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

      if (res && res.errCode === 0) {
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

  getStatusText = (statusId) => {
    switch (statusId) {
      case 'S1':
        return { text: 'Chờ xác nhận email', className: 'status-pending' };
      case 'S2':
        return { text: 'Chờ khám', className: 'status-confirmed' };
      case 'S3':
        return { text: 'Đã khám xong', className: 'status-completed' };
      case 'S4':
        return { text: 'Đã hủy', className: 'status-cancelled' };
      default:
        return { text: 'Không xác định', className: '' };
    }
  };

  render() {
    const { isOpen, closeModal, language } = this.props;
    const { filteredBookings, activeTab, isLoading, showConfirmCancel } = this.state;

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
                  const status = this.getStatusText(booking.statusId);
                  const canCancel =
                    activeTab === 'upcoming' &&
                    booking.statusId === 'S2';

                  return (
                    <div key={index} className="booking-item">
                      <div className="booking-header">
                        <div className="booking-date">
                          <i className="fas fa-calendar"></i>
                          <strong>
                            {booking.date 
                              ? moment(+booking.date).format('DD/MM/YYYY')
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
                            {booking.doctorData
                              ? `${booking.doctorData.lastName} ${booking.doctorData.firstName}`
                              : 'N/A'}
                          </span>
                        </div>

                        {booking.timeTypeDataPatient && (
                          <div className="detail-row">
                            <i className="fas fa-clock"></i>
                            <span>
                              <strong>Thời gian:</strong>{' '}
                              {language === LANGUAGES.VI
                                ? booking.timeTypeDataPatient.valueVi
                                : booking.timeTypeDataPatient.valueEn}
                            </span>
                          </div>
                        )}

                        {booking.doctorData &&
                          booking.doctorData.Doctor_Info &&
                          booking.doctorData.Doctor_Info.specialtyData && (
                            <div className="detail-row">
                              <i className="fas fa-stethoscope"></i>
                              <span>
                                <strong>Chuyên khoa:</strong>{' '}
                                {booking.doctorData.Doctor_Info.specialtyData.name}
                              </span>
                            </div>
                          )}

                        {booking.doctorData &&
                          booking.doctorData.Doctor_Info &&
                          booking.doctorData.Doctor_Info.clinicData && (
                            <div className="detail-row">
                              <i className="fas fa-hospital"></i>
                              <span>
                                <strong>Phòng khám:</strong>{' '}
                                {booking.doctorData.Doctor_Info.clinicData.name}
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
