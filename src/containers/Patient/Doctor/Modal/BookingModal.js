/** @format */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './BookingModal.scss';
import { Button, Modal } from 'reactstrap';
import ProfileDoctor from '../ProfileDoctor';
import _ from 'lodash';
import DatePicker from '../../../../components/Input/DatePicker';
import * as actions from '../../../../store/actions';
import { LANGUAGES } from '../../../../utils';
import Select from 'react-select';
import { postPatientBookAppointment } from '../../../../services/userService';
import { toast } from 'react-toastify';
import moment from 'moment';
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
      reason: '',
      birthday: '',
      selectedGender: '',
      doctorId: '',
      genders: '',
      timeType: '',
      isShowLoading: false,
    };
  }

  async componentDidMount() {
    // Use static gender list instead of fetching from Redux allcode
    const genders = [
      { keyMap: 'Nam', valueVi: 'Nam', valueEn: 'Male' },
      { keyMap: 'Nữ', valueVi: 'Nữ', valueEn: 'Female' },
      { keyMap: 'Khác', valueVi: 'Khác', valueEn: 'Other' },
    ];
    this.setState({ genders: this.buildDataGender(genders) });
  }

  // Fill user Info when modal opens
  fillUserFromProps = () => {
    const { isLoggedIn, userInfo } = this.props;
    if (isLoggedIn && userInfo) {
      const fullName =
        userInfo.fullName ||
        `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim();
      const phoneNumber =
        userInfo.phoneNumber || userInfo.phonenumber || userInfo.phone || '';
      const email = userInfo.email || '';
      const address = userInfo.address || '';
      let birthday = '';

      // find matching gender option (value may be stored as 'gender' or 'genderId')
      let selectedGender = this.state.selectedGender;
      const genderKey =
        userInfo.gender ||
        userInfo.genderId ||
        userInfo.sex ||
        userInfo.gender_key;
      if (
        genderKey &&
        this.state.genders &&
        Array.isArray(this.state.genders)
      ) {
        const match = this.state.genders.find(
          (g) => String(g.value) === String(genderKey)
        );
        if (match) selectedGender = match;
      }

      const reason = userInfo.reason || this.state.reason || '';

      this.setState({
        fullName: fullName || this.state.fullName,
        phoneNumber: phoneNumber || this.state.phoneNumber,
        email: email || this.state.email,
        address: address || this.state.address,
        birthday: birthday || this.state.birthday,
        selectedGender: selectedGender,
        reason: reason,
      });
    }
  };

  buildDataGender = (data) => {
    let result = [];
    let language = this.props.language;
    if (data && data.length > 0) {
      data.map((item) => {
        let object = {};
        object.label = language === LANGUAGES.VI ? item.valueVi : item.valueEn;
        object.value = item.keyMap;
        return result.push(object);
      });
    }
    return result;
  };

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.language !== prevProps.language) {
      const genders = [
        { keyMap: 'Nam', valueVi: 'Nam', valueEn: 'Male' },
        { keyMap: 'Nữ', valueVi: 'Nữ', valueEn: 'Female' },
        { keyMap: 'Khác', valueVi: 'Khác', valueEn: 'Other' },
      ];
      this.setState({ genders: this.buildDataGender(genders) });
    }
    // No longer need to react to props.genders
    if (this.props.dataTime !== prevProps.dataTime) {
      if (this.props.dataTime && !_.isEmpty(this.props.dataTime)) {
        let doctorId = this.props.dataTime.doctorId;
        let timeType = this.props.dataTime.timeType;
        this.setState({
          doctorId: doctorId,
          timeType: timeType,
        });
      }
    }

    // When modal is opened, auto-fill user Info or redirect to login
    if (this.props.isOpenModal && !prevProps.isOpenModal) {
      if (this.props.isLoggedIn) {
        // Genders already built statically in componentDidMount; just fill user info
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

  handelOnDatePicker = (date) => {
    this.setState({
      birthday: date[0],
    });
  };

  handleChangeSelect = (selectedOption) => {
    this.setState({ selectedGender: selectedOption });
  };

  buildTimeBooking = (dataTime) => {
    let { language } = this.props;
    if (dataTime && !_.isEmpty(dataTime)) {
      let time =
        language === LANGUAGES.VI
          ? dataTime.timeTypeData.valueVi
          : dataTime.timeTypeData.valueEn;

      let date =
        language === LANGUAGES.VI
          ? moment.unix(+dataTime.date / 1000).format('dddd - DD/MM/YYYY')
          : moment
              .unix(+dataTime.date / 1000)
              .locale('en')
              .format('dddd - DD/MM/YYYY');

      return `${time} - ${date}}`;
    }
    return '';
  };

  buildDoctorName = (dataTime) => {
    let { language } = this.props;
    if (dataTime && !_.isEmpty(dataTime)) {
      let name =
        language === LANGUAGES.VI
          ? `${dataTime.doctorData.lastName} ${dataTime.doctorData.firstName}`
          : `${dataTime.doctorData.firstName} ${dataTime.doctorData.lastName}`;
      return name;
    }
    return '';
  };

  handleConfirmBooking = async () => {
    this.setState({ isShowLoading: true });
    // validate input
    let date = new Date(this.state.birthday).getTime();
    let timeString = this.buildTimeBooking(this.props.dataTime);
    let doctorName = this.buildDoctorName(this.props.dataTime);

    let res = await postPatientBookAppointment({
      fullName: this.state.fullName,
      phoneNumber: this.state.phoneNumber,
      email: this.state.email,
      address: this.state.address,
      reason: this.state.reason,
      date: this.props.dataTime.date,
      birthday: date,
      selectedGender: this.state.selectedGender.value,
      doctorId: this.state.doctorId,
      timeType: this.state.timeType,
      language: this.props.language,
      timeString: timeString,
      doctorName: doctorName,
    });

    this.setState({ isShowLoading: false });
    if (res && res.errCode === 0) {
      toast.success('Đặt lịch hẹn mới thành công!');
      this.props.closeBookingClose();
    } else {
      toast.error('Đặt lịch hẹn mới thất bại!');
    }

    console.log('Booking a new appointment', this.state);
  };

  render() {
    // toggle={}
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
          // backdrop={true}
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
              {/* {JSON.stringify(dataTime)} */}
              <div className="doctor-Infor">
                <ProfileDoctor
                  doctorId={doctorId}
                  isShowDescriptionDoctor={false}
                  dataTime={dataTime}
                  isShowLinkDetail={false}
                  isShowPrice={true}
                />
              </div>

              <div className="row">
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.fullName" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.fullName}
                    onChange={(event) =>
                      this.handelOnChangeInput(event, 'fullName')
                    }
                  />
                </div>

                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.phoneNumber" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.phoneNumber}
                    onChange={(event) =>
                      this.handelOnChangeInput(event, 'phoneNumber')
                    }
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.email" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.email}
                    onChange={(event) =>
                      this.handelOnChangeInput(event, 'email')
                    }
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.address" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.address}
                    onChange={(event) =>
                      this.handelOnChangeInput(event, 'address')
                    }
                  />
                </div>
                <div className="col-12 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.reason" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.reason}
                    onChange={(event) =>
                      this.handelOnChangeInput(event, 'reason')
                    }
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.birthday" />
                  </label>
                  <DatePicker
                    onChange={this.handelOnDatePicker}
                    className="form-control"
                    value={this.state.birthday}
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.gender" />
                  </label>
                  <Select
                    value={this.state.selectedGender}
                    onChange={this.handleChangeSelect}
                    options={this.state.genders}
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
