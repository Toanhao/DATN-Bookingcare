/** @format */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import './QuickBookingModal.scss';
import { Modal } from 'reactstrap';
import DatePicker from '../../../../components/Input/DatePicker';
import { LANGUAGES } from '../../../../utils';
import Select from 'react-select';
import {
  getAllSpecialty,
  getAllClinic,
  getDoctorsFiltered,
  getScheduleDoctorByDate,
  createBooking,
} from '../../../../services/userService';
import { toast } from 'react-toastify';
import moment from 'moment';
import LoadingOverlay from 'react-loading-overlay';
import { withRouter } from 'react-router-dom';

class QuickBookingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 1,
      // Step 1: Chọn chuyên khoa
      specialties: [],
      selectedSpecialty: null,

      // Step 2: Chọn cơ sở y tế
      clinics: [],
      selectedClinic: null,

      // Step 3: Chọn ngày khám, bác sĩ
      selectedDate: null,
      doctors: [],
      selectedDoctor: null,
      timeSlots: [],
      selectedTime: null,

      // Thông tin bệnh nhân
      fullName: '',
      phoneNumber: '',
      email: '',
      address: '',
      reason: '',
      birthday: '',

      isShowLoading: false,
    };
  }

  async componentDidMount() {
    const today = this.getToday();
    this.setState({ selectedDate: today });
    await this.loadSpecialties();
    await this.loadClinics();
  }

  componentDidUpdate(prevProps) {
    // Auto-fill user info when modal opens
    if (this.props.isOpenModal && !prevProps.isOpenModal) {
      // Reset date to today on open
      const today = this.getToday();
      this.setState({ selectedDate: today });
      if (this.props.isLoggedIn) {
        this.fillUserFromProps();
      } else {
        if (this.props.closeModal) this.props.closeModal();
        if (this.props.history && this.props.history.push) {
          this.props.history.push('/login');
        }
      }
    }
  }

  fillUserFromProps = () => {
    const { isLoggedIn, userInfo } = this.props;
    if (isLoggedIn && userInfo) {
      const fullName =
        userInfo.fullName;
      const phoneNumber =
        userInfo.phoneNumber || userInfo.phonenumber || userInfo.phone || '';
      const email = userInfo.email || '';
      const address = userInfo.address || '';
      const birthday = userInfo.birthday ? new Date(userInfo.birthday) : '';

      this.setState({
        fullName: fullName || this.state.fullName,
        phoneNumber: phoneNumber || this.state.phoneNumber,
        email: email || this.state.email,
        address: address || this.state.address,
        birthday: birthday || this.state.birthday,
      });
    }
  };

  getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  loadSpecialties = async () => {
    try {
      let res = await getAllSpecialty();
      if (res && res.errCode === 0) {
        let specialtyOptions = res.data.map((item) => ({
          value: item.id,
          label: item.name,
          data: item,
        }));
        this.setState({ specialties: specialtyOptions });
      }
    } catch (e) {
      console.log('Error loading specialties:', e);
    }
  };

  loadClinics = async () => {
    try {
      let res = await getAllClinic();
      if (res && res.errCode === 0) {
        let clinicOptions = res.data.map((item) => ({
          value: item.id,
          label: item.name,
          data: item,
        }));
        this.setState({ clinics: clinicOptions });
      }
    } catch (e) {
      console.log('Error loading clinics:', e);
    }
  };

  loadDoctors = async () => {
    try {
      const { selectedSpecialty, selectedClinic } = this.state;
      if (!selectedSpecialty || !selectedClinic) return;

      const res = await getDoctorsFiltered(
        selectedClinic.value,
        selectedSpecialty.value,
        true
      );

      const doctors = Array.isArray(res) ? res : res?.data;
      const doctorOptions = (doctors || []).map((item) => ({
        value: item.id,
        label:
          item.user?.fullName,
        data: item,
      }));

      this.setState({ doctors: doctorOptions });
    } catch (e) {
      console.log('Error loading doctors:', e);
    }
  };

  loadTimeSlots = async () => {
    try {
      let { selectedDoctor, selectedDate } = this.state;
      if (!selectedDoctor || !selectedDate) return;

      // Use YYYY-MM-DD to match backend DATE comparison
      const dateStr = moment(selectedDate).format('YYYY-MM-DD');
      let res = await getScheduleDoctorByDate(
        selectedDoctor.value,
        dateStr
      );

      const schedules = Array.isArray(res) ? res : res?.data;
      if (Array.isArray(schedules) && schedules.length > 0) {
        const timeOptions = schedules.map((item) => {
          const label =
            item.timeSlot?.label ||
            item.timeSlot?.valueVi ||
            item.timeSlot?.valueEn ||
            (item.timeSlot?.startTime && item.timeSlot?.endTime
              ? `${item.timeSlot.startTime} - ${item.timeSlot.endTime}`
              : 'Giờ không xác định');
          return { value: item.id, label, data: item };
        });
        this.setState({ timeSlots: timeOptions });
      } else {
        this.setState({ timeSlots: [] });
        toast.info('Không có lịch khám trong ngày này!');
      }
    } catch (e) {
      console.log('Error loading time slots:', e);
      this.setState({ timeSlots: [] });
    }
  };

  getActiveBookingCount = (schedule) => {
    if (!schedule || !Array.isArray(schedule.bookings)) return 0;
    return schedule.bookings.filter((b) =>
      ['PENDING', 'CONFIRMED'].includes(b.status)
    ).length;
  };

  handleSelectSpecialty = (selectedOption) => {
    // Reset downstream selections when specialty changes
    this.setState(
      {
        selectedSpecialty: selectedOption,
        selectedDoctor: null,
        timeSlots: [],
        selectedTime: null,
        doctors: [],
      },
      () => {
        // Reload doctors only when both specialty & clinic selected
        if (this.state.selectedClinic && this.state.selectedSpecialty) {
          this.loadDoctors();
        }
      }
    );
  };

  handleSelectClinic = (selectedOption) => {
    // Reset downstream selections when clinic changes
    this.setState(
      {
        selectedClinic: selectedOption,
        selectedDoctor: null,
        timeSlots: [],
        selectedTime: null,
        doctors: [],
      },
      () => {
        // Reload doctors only when both specialty & clinic selected
        if (this.state.selectedClinic && this.state.selectedSpecialty) {
          this.loadDoctors();
        }
      }
    );
  };

  handleSelectDate = (date) => {
    // Update date, reset times, and reload schedules for selected doctor
    this.setState(
      {
        selectedDate: date[0],
        timeSlots: [],
        selectedTime: null,
      },
      () => {
        if (this.state.selectedDoctor) {
          this.loadTimeSlots();
        }
      }
    );
  };

  handleSelectDoctor = (selectedOption) => {
    this.setState({ selectedDoctor: selectedOption }, () => {
      this.loadTimeSlots();
    });
  };

  handleSelectTime = (selectedOption) => {
    this.setState({ selectedTime: selectedOption });
  };

  handleOnChangeInput = (event, id) => {
    this.setState({ [id]: event.target.value });
  };

  validateStep = (step) => {
    const {
      selectedSpecialty,
      selectedClinic,
      selectedDoctor,
      selectedDate,
      timeSlots,
      selectedTime,
    } = this.state;

    if (step === 1 && !selectedSpecialty) {
      toast.error('Vui lòng chọn chuyên khoa!');
      return false;
    }
    if (step === 2 && !selectedClinic) {
      toast.error('Vui lòng chọn cơ sở y tế!');
      return false;
    }
    if (step === 3) {
      if (!selectedDoctor) {
        toast.error('Vui lòng chọn bác sĩ!');
        return false;
      }
      if (!selectedDate) {
        toast.error('Vui lòng chọn ngày khám!');
        return false;
      }
      if (timeSlots.length === 0) {
        toast.error('Hôm nay bác sĩ không có lịch khám!');
        return false;
      }
      if (!selectedTime) {
        toast.error('Vui lòng chọn giờ khám!');
        return false;
      }
    }

    return true;
  };

  nextStep = () => {
    let { currentStep } = this.state;
    const totalSteps = 4;

    if (!this.validateStep(currentStep)) return;

    if (currentStep < totalSteps) {
      this.setState({ currentStep: currentStep + 1 });
    }
  };

  prevStep = () => {
    let { currentStep } = this.state;
    if (currentStep > 1) {
      this.setState({ currentStep: currentStep - 1 });
    }
  };

  handleStepClick = (step) => {
    const { currentStep } = this.state;
    // Allow navigating backward freely
    if (step <= currentStep) {
      this.setState({ currentStep: step });
      return;
    }
    // Prevent jumping forward; ask user to complete current step
    toast.info('Vui lòng hoàn thành bước hiện tại trước khi tiếp tục.');
  };

  handleConfirmBooking = async () => {
    const stepsToValidate = [1, 2, 3];
    for (const step of stepsToValidate) {
      if (!this.validateStep(step)) return;
    }

    // Require reason like BookingModal
    if (!this.state.reason || !this.state.reason.trim()) {
      toast.error('Vui lòng nhập lý do khám!');
      return;
    }

    const { userInfo } = this.props;
    if (!userInfo || !userInfo.id) {
      toast.error('Vui lòng đăng nhập!');
      return;
    }

    // Use scheduleId from selected time slot
    const scheduleId = this.state.selectedTime?.value || this.state.selectedTime?.data?.id;
    if (!scheduleId) {
      toast.error('Không tìm thấy lịch khám!');
      return;
    }

    this.setState({ isShowLoading: true });

    try {
      const res = await createBooking({
        patientId: userInfo.id,
        scheduleId: scheduleId,
        reason: this.state.reason.trim(),
      });

      this.setState({ isShowLoading: false });

      // axios interceptor may return booking object directly
      if (res && res.id) {
        toast.success('Đặt lịch khám nhanh thành công!');
        this.props.closeModal();
        this.resetForm();
      } else {
        toast.error('Đặt lịch khám thất bại!');
      }
    } catch (e) {
      this.setState({ isShowLoading: false });
      const message = e.message || 'Có lỗi xảy ra khi đặt lịch!';
      toast.error(message);
      console.log('Error booking:', e);
    }
  };

  resetForm = () => {
    const today = this.getToday();
    this.setState({
      currentStep: 1,
      selectedSpecialty: null,
      selectedClinic: null,
      selectedDate: today,
      selectedDoctor: null,
      selectedTime: null,
      doctors: [],
      timeSlots: [],
      fullName: '',
      phoneNumber: '',
      email: '',
      address: '',
      reason: '',
      birthday: '',
    });
  };

  renderStepIndicator = () => {
    let { currentStep } = this.state;
    let steps = [
      { number: 1, label: 'Chuyên khoa' },
      { number: 2, label: 'Cơ sở' },
      { number: 3, label: 'Bác sĩ & Giờ' },
      { number: 4, label: 'Thông tin' },
    ];

    return (
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`step ${currentStep >= step.number ? 'active' : ''} ${
              currentStep === step.number ? 'current' : ''
            }`}
            onClick={() => this.handleStepClick(step.number)}
          >
            <div className="step-number">{step.number}</div>
            <div className="step-label">{step.label}</div>
            {index < steps.length - 1 && <div className="step-line"></div>}
          </div>
        ))}
      </div>
    );
  };

  renderStepContent = () => {
    let { currentStep } = this.state;

    switch (currentStep) {
      case 1:
        return this.renderSpecialtyStep();
      case 2:
        return this.renderClinicStep();
      case 3:
        return this.renderDoctorStep();
      case 4:
        return this.renderPatientInfoStep();
      default:
        return null;
    }
  };

  renderSpecialtyStep = () => {
    return (
      <div className="step-content">
        <h4 className="step-title">
          <i className="fas fa-stethoscope"></i> Chọn chuyên khoa khám
        </h4>
        <p className="step-description">Bạn muốn khám chuyên khoa nào?</p>
        <Select
          value={this.state.selectedSpecialty}
          onChange={this.handleSelectSpecialty}
          options={this.state.specialties}
          placeholder="Chọn chuyên khoa..."
          className="select-specialty"
        />
      </div>
    );
  };

  renderClinicStep = () => {
    return (
      <div className="step-content">
        <h4 className="step-title">
          <i className="fas fa-hospital"></i> Chọn cơ sở y tế
        </h4>
        <p className="step-description">
          Chọn bệnh viện hoặc phòng khám bạn muốn đến
        </p>
        <Select
          value={this.state.selectedClinic}
          onChange={this.handleSelectClinic}
          options={this.state.clinics}
          placeholder="Chọn cơ sở y tế..."
          className="select-clinic"
        />

        {this.state.selectedClinic && (
          <div className="clinic-info">
            <p>
              <strong>Thông tin cơ sở:</strong>
            </p>
            <p>
              <strong>Tên cơ sở:</strong>{' '}
              {this.state.selectedClinic.data.name}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {this.state.selectedClinic.data.address}
            </p>
          </div>
        )}
      </div>
    );
  };

  renderDoctorStep = () => {
    const { selectedDoctor, doctors, timeSlots, selectedTime, selectedDate } = this.state;
    const { language } = this.props;

    return (
      <div className="step-content">
        <h4 className="step-title">
          <i className="fas fa-user-md"></i> Chọn bác sĩ
        </h4>
        <p className="step-description">Chọn bác sĩ bạn muốn khám và ngày khám</p>
        <Select
          value={selectedDoctor}
          onChange={this.handleSelectDoctor}
          options={doctors}
          placeholder="Chọn bác sĩ..."
          className="select-doctor"
        />

        {/* Chọn ngày trong cùng bước bác sĩ */}
        <div className="doctor-date-wrapper">
          <DatePicker
            onChange={this.handleSelectDate}
            className="form-control date-picker-quick"
            value={selectedDate}
            placeholder="Chọn ngày khám..."
            minDate={this.getToday()}
          />
        </div>

        {!selectedDoctor && doctors.length === 0 && (
          <div className="no-doctor-alert">
            <p>
              <i className="fas fa-info-circle"></i> Không có bác sĩ nào thoả
              mãn điều kiện, hãy chọn chuyên khoa và cơ sở khác
            </p>
          </div>
        )}

        {/* Hiển thị giá khám khi đã chọn bác sĩ */}
        {selectedDoctor && selectedDoctor.data && (
          <div className="doctor-fee-box">
            <p>
              <strong>
                {language === LANGUAGES.VI
                  ? 'Giá khám: '
                  : 'Examination Fee: '}
              </strong>
              <span className="fee-value">
                {selectedDoctor.data.fee != null
                  ? `${selectedDoctor.data.fee} VND`
                  : 'N/A'}
              </span>
            </p>
          </div>
        )}

        {/* Khi chọn bác sĩ và ngày, có timeSlots */}
        {selectedDoctor && selectedDate && timeSlots.length > 0 && (
          <div className="time-slots-section">
            <h5 className="time-title">
              <i className="fas fa-clock"></i> Chọn giờ khám
            </h5>
            <div className="time-slots-grid">
              {timeSlots.map((time) => (
                <div
                  key={time.value}
                  className={`time-slot ${
                    selectedTime && selectedTime.value === time.value
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => this.handleSelectTime(time)}
                >
                  <i className="far fa-clock"></i> {time.label}
                </div>
              ))}
            </div>
            {selectedTime && (
              <div className="time-queue-hint">
                {(() => {
                  const maxPatient = selectedTime.data?.maxPatient;
                  const activeBookings = this.getActiveBookingCount(selectedTime.data);
                  const yourNumber = maxPatient
                    ? Math.min(activeBookings + 1, maxPatient)
                    : activeBookings + 1;
                  if (!maxPatient) {
                    return (
                      <span>
                        Số thứ tự dự kiến của bạn: {yourNumber}
                      </span>
                    );
                  }

                  // Kiểm tra nếu lịch đã đầy
                  if (activeBookings >= maxPatient) {
                    return (
                      <span style={{ color: '#dc3545' }}>
                        <i className="fas fa-exclamation-circle"></i> Lịch khám này đã đầy ({activeBookings}/{maxPatient}). Vui lòng chọn giờ khác hoặc ngày khác.
                      </span>
                    );
                  }

                  return (
                    <span>
                      Hiện có {activeBookings}/{maxPatient} người đã đăng ký. Số thứ tự dự kiến của bạn: {yourNumber}/{maxPatient}.
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Khi chọn bác sĩ và ngày, nhưng không có timeSlots */}
        {selectedDoctor && selectedDate && timeSlots.length === 0 && (
          <div className="no-time-slot-alert">
            <p>
              <i className="fas fa-calendar-times"></i> Hôm nay bác sĩ không có
              lịch khám
            </p>
          </div>
        )}
      </div>
    );
  };

  renderPatientInfoStep = () => {
    return (
      <div className="step-content patient-info-content">
        <h4 className="step-title">
          <i className="fas fa-user-edit"></i> Thông tin bệnh nhân
        </h4>

        <div className="booking-summary">
          <h5>Thông tin đặt lịch:</h5>
          <div className="summary-item">
            <strong>Chuyên khoa:</strong> {this.state.selectedSpecialty?.label}
          </div>
          <div className="summary-item">
            <strong>Cơ sở:</strong> {this.state.selectedClinic?.label}
          </div>
          <div className="summary-item">
            <strong>Bác sĩ:</strong> {this.state.selectedDoctor?.label}
          </div>
          {this.state.selectedDoctor?.data?.fee != null && (
            <div className="summary-item">
              <strong>Giá khám:</strong>{' '}
              {`${this.state.selectedDoctor.data.fee} VND`}
            </div>
          )}
          <div className="summary-item">
            <strong>Ngày:</strong>{' '}
            {this.state.selectedDate &&
              moment(this.state.selectedDate).format('DD/MM/YYYY')}
          </div>
          <div className="summary-item">
            <strong>Giờ:</strong> {this.state.selectedTime?.label}
          </div>
        </div>

        <div className="row patient-form">
          <div className="col-6 form-group">
            <label>
              Họ và tên <span className="required">*</span>
            </label>
            <input
              className="form-control"
              value={this.state.fullName}
              readOnly
              placeholder="Họ và tên"
            />
          </div>

          <div className="col-6 form-group">
            <label>
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              className="form-control"
              value={this.state.phoneNumber}
              readOnly
              placeholder="Số điện thoại"
            />
          </div>

          <div className="col-6 form-group">
            <label>
              Email <span className="required">*</span>
            </label>
            <input
              className="form-control"
              value={this.state.email}
              readOnly
              placeholder="Email"
            />
          </div>

          <div className="col-6 form-group">
            <label>Địa chỉ</label>
            <input
              className="form-control"
              value={this.state.address}
              readOnly
              placeholder="Địa chỉ"
            />
          </div>

          <div className="col-6 form-group">
            <label>Ngày sinh</label>
            <DatePicker
              className="form-control"
              value={this.state.birthday}
              disabled={true}
              placeholder="Ngày sinh"
            />
          </div>

          <div className="col-12 form-group">
            <label>Lý do khám</label>
            <textarea
              className="form-control"
              rows="3"
              value={this.state.reason}
              onChange={(event) => this.handleOnChangeInput(event, 'reason')}
              placeholder="Nhập lý do khám bệnh..."
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    let { isOpenModal, closeModal } = this.props;

    return (
      <LoadingOverlay
        active={this.state.isShowLoading}
        spinner
        text="Đang xử lý..."
      >
        <Modal
          isOpen={isOpenModal}
          className="quick-booking-modal-container"
          size="lg"
          centered={true}
        >
          <div className="quick-booking-modal-content">
            <div className="quick-booking-modal-header">
              <div className="header-content">
                <h3>
                  <i className="fas fa-calendar-alt"></i> Đặt lịch khám nhanh
                </h3>
                <p>Chỉ 4 bước đơn giản để đặt lịch khám bệnh</p>
              </div>
              <span className="close-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </span>
            </div>

            <div className="quick-booking-modal-body">
              {this.renderStepIndicator()}
              {this.renderStepContent()}
            </div>

            <div className="quick-booking-modal-footer">
              {this.state.currentStep > 1 && (
                <button className="btn-prev" onClick={this.prevStep}>
                  <i className="fas fa-arrow-left"></i> Quay lại
                </button>
              )}

              {this.state.currentStep < 4 && (
                <button className="btn-next" onClick={this.nextStep}>
                  Tiếp tục <i className="fas fa-arrow-right"></i>
                </button>
              )}

              {this.state.currentStep === 4 && (
                <button
                  className="btn-confirm"
                  onClick={this.handleConfirmBooking}
                >
                  <i className="fas fa-check-circle"></i> Xác nhận đặt lịch
                </button>
              )}

              <button className="btn-cancel" onClick={closeModal}>
                Hủy bỏ
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
  connect(mapStateToProps, mapDispatchToProps)(QuickBookingModal)
);
