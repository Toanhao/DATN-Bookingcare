/** @format */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './BookingModal.scss';
import { Modal } from 'reactstrap';
import ProfileDoctor from '../ProfileDoctor';
import _ from 'lodash';
import DatePicker from '../../../../components/Input/DatePicker';
import { createBooking } from '../../../../services/userService';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import { withRouter } from 'react-router-dom';

class BookingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      phoneNumber: '',
      email: '',
      address: '',
      gender: '',
      reason: '',
      birthday: '',
      scheduleId: '',
      isShowLoading: false,
    };
  }

  async componentDidMount() {
  }

  fillUserFromProps = () => {
    const { isLoggedIn, userInfo } = this.props;
    if (isLoggedIn && userInfo) {
      console.log('User info in booking modal:', userInfo);
      const fullName = userInfo.fullName || '';
      const phoneNumber = userInfo.phoneNumber || '';
      const email = userInfo.email || '';
      const address = userInfo.address || '';
      const gender = userInfo.gender || '';
      
      const birthday = userInfo.birthday ? new Date(userInfo.birthday) : null;

      this.setState({
        fullName,
        phoneNumber,
        email,
        address,
        gender,
        birthday,
      });
    }
  };

  async componentDidUpdate(prevProps, prevState, snapshot) {
    // Get scheduleId from dataTime
    if (this.props.dataTime !== prevProps.dataTime) {
      if (this.props.dataTime && !_.isEmpty(this.props.dataTime)) {
        let scheduleId = this.props.dataTime.id;
        this.setState({
          scheduleId: scheduleId,
        });
      }
    }

    // When modal is opened, fill user info or redirect to login
    if (this.props.isOpenModal && !prevProps.isOpenModal) {
      if (this.props.isLoggedIn) {
        this.fillUserFromProps();
      } else {
        // not logged in -> redirect to login and close modal
        if (this.props.closeBookingClose) this.props.closeBookingClose();
        // use history from withRouter
        if (this.props.history && this.props.history.push) {
          this.props.history.push('/login');
        }
      }
    }
  }

  handelOnChangeInput = (event, id) => {
    let valueInput = event.target.value;
    let stateCopy = { ...this.state };
    stateCopy[id] = valueInput;
    this.setState({
      ...stateCopy,
    });
  };

  getActiveBookingCount = (schedule) => {
    if (!schedule || !Array.isArray(schedule.bookings)) return 0;
    return schedule.bookings.filter((b) =>
      ['PENDING', 'CONFIRMED'].includes(b.status)
    ).length;
  };

  handleConfirmBooking = async () => {
    const { userInfo } = this.props;
    const { reason, scheduleId } = this.state;

    // Validate input
    if (!reason || !reason.trim()) {
      toast.error('Vui lòng nhập lý do khám!');
      return;
    }

    if (!scheduleId) {
      toast.error('Không tìm thấy lịch khám!');
      return;
    }

    if (!userInfo || !userInfo.id) {
      toast.error('Vui lòng đăng nhập!');
      return;
    }

    this.setState({ isShowLoading: true });

    try {
      const res = await createBooking({
        patientId: userInfo.id,
        scheduleId: scheduleId,
        reason: reason.trim(),
      });

      this.setState({ isShowLoading: false });

      // res sẽ là booking object do axios interceptor return response.data
      if (res && res.id) {
        toast.success('Đặt lịch hẹn thành công! Vui lòng kiểm tra email để xác nhận.');
        this.setState({ reason: '' }); // Reset form
        this.props.closeBookingClose();
      } else {
        toast.error('Đặt lịch hẹn thất bại!');
      }
    } catch (error) {
      this.setState({ isShowLoading: false });
      const message = error.message || 'Đặt lịch hẹn thất bại!';
      toast.error(message);
    }
  };

  render() {
    let { isOpenModal, closeBookingClose, dataTime } = this.props;
    let doctorId = '';
    if (dataTime && !_.isEmpty(dataTime)) {
      doctorId = dataTime.doctorId;
    }
    return (
      <LoadingOverlay
        active={this.state.isShowLoading}
        spinner
        text="Loading..."
      >
        <Modal
          isOpen={isOpenModal}
          className={'booking-modal-container'}
          size="lg"
          centered={true}
        >
          <div className="booking-modal-content">
            <div className="booking-modal-header">
              <span className="left">
                <FormattedMessage id="patient.booking-modal.title" />
              </span>
              <span className="right" onClick={closeBookingClose}>
                <i className="fas fa-times"></i>
              </span>
            </div>

            <div className="booking-modal-body">
              <div className="doctor-Infor">
                <ProfileDoctor
                  doctorId={doctorId}
                  isShowDescriptionDoctor={false}
                  dataTime={dataTime}
                  isShowLinkDetail={false}
                  isShowPrice={true}
                />
              </div>

              {dataTime && !_.isEmpty(dataTime) && (
                <div className="queue-info">
                  {(() => {
                    const maxPatient = dataTime.maxPatient;
                    const activeBookings = this.getActiveBookingCount(dataTime);
                    const yourNumber = maxPatient
                      ? Math.min(activeBookings + 1, maxPatient)
                      : activeBookings + 1;
                    if (!maxPatient) {
                      return (
                        <div className="queue-hint">
                          <i className="fas fa-info-circle"></i>
                          <span>
                            Số thứ tự dự kiến của bạn: <strong>{yourNumber}</strong>
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div className="queue-hint">
                        <i className="fas fa-info-circle"></i>
                        <span>
                          Hiện có <strong>{activeBookings}/{maxPatient}</strong> người đã đăng ký. 
                          Số thứ tự dự kiến của bạn: <strong>{yourNumber}/{maxPatient}</strong>.
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="row">
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.fullName" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.fullName}
                    readOnly
                  />
                </div>

                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.phoneNumber" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.phoneNumber}
                    readOnly
                  />
                </div>

                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.email" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.email}
                    readOnly
                  />
                </div>

                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.address" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.address}
                    readOnly
                  />
                </div>

                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.birthday" />
                  </label>
                  <DatePicker
                    className="form-control"
                    value={this.state.birthday ? new Date(this.state.birthday) : null}
                    disabled={true}
                  />
                </div>

                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.gender" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.gender}
                    readOnly
                  />
                </div>

                <div className="col-12 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.reason" />
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Nhập lý do khám bệnh..."
                    value={this.state.reason}
                    onChange={(event) =>
                      this.handelOnChangeInput(event, 'reason')
                    }
                  />
                </div>
              </div>
            </div>

            <div className="booking-modal-footer">
              <button
                className="bnt-booking-confirm"
                onClick={() => this.handleConfirmBooking()}
              >
                <FormattedMessage id="patient.booking-modal.btnConfirm" />
              </button>
              <button
                className="bnt-booking-cancel"
                onClick={closeBookingClose}
              >
                <FormattedMessage id="patient.booking-modal.btnCancel" />
              </button>
            </div>
          </div>
        </Modal>
      </LoadingOverlay>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    isLoggedIn: state.user && state.user.isLoggedIn,
    userInfo: state.user && state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(BookingModal)
);
