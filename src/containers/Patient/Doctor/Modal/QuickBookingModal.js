/** @format */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './QuickBookingModal.scss';
import { Modal } from 'reactstrap';
import _ from 'lodash';
import DatePicker from '../../../../components/Input/DatePicker';
import * as actions from '../../../../store/actions';
import { LANGUAGES } from '../../../../utils';
import Select from 'react-select';
import {
  getAllSpecialty,
  getAllClinic,
  getAllDoctors,
  getScheduleDoctorByDate,
  postPatientBookAppointment,
  getExtraInforDoctorById,
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
      totalSteps: 5,

      // Step 1: Chọn chuyên khoa
      specialties: [],
      selectedSpecialty: null,

      // Step 2: Chọn cơ sở y tế
      clinics: [],
      selectedClinic: null,

      // Step 3: Chọn ngày khám
      selectedDate: '',

      // Step 4: Chọn bác sĩ
      doctors: [],
      selectedDoctor: null,

      // Step 5: Chọn giờ khám
      timeSlots: [],
      selectedTime: null,

      // Thông tin bệnh nhân
      fullName: '',
      phoneNumber: '',
      email: '',
      address: '',
      reason: '',
      birthday: '',
      selectedGender: '',
      genders: [],

      isShowLoading: false,
    };
  }

  async componentDidMount() {
    await this.loadSpecialties();
    await this.loadClinics();
    this.props.getGenders();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.language !== prevProps.language) {
      this.setState({
        genders: this.buildDataGender(this.props.genders),
      });
    }
    if (this.props.genders !== prevProps.genders) {
      this.setState({
        genders: this.buildDataGender(this.props.genders),
      });
    }

    // Auto-fill user info when modal opens
    if (this.props.isOpenModal && !prevProps.isOpenModal) {
      if (this.props.isLoggedIn) {
        if (!this.state.genders || this.state.genders.length === 0) {
          this.setState(
            { genders: this.buildDataGender(this.props.genders) },
            () => {
              this.fillUserFromProps();
            }
          );
        } else {
          this.fillUserFromProps();
        }
      } else {
        if (this.props.closeModal) this.props.closeModal();
        if (this.props.history && this.props.history.push) {
          this.props.history.push('/login');
        }
      }
    }
  }

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

      this.setState({
        fullName: fullName || this.state.fullName,
        phoneNumber: phoneNumber || this.state.phoneNumber,
        email: email || this.state.email,
        address: address || this.state.address,
        selectedGender: selectedGender,
      });
    }
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
      let res = await getAllDoctors();
      if (res && res.errCode === 0) {
        let { language } = this.props;
        let { selectedSpecialty, selectedClinic } = this.state;

        // Filter doctors based on specialty and clinic
        let filteredDoctors = res.data;

        // Filter by specialty
        if (selectedSpecialty && selectedSpecialty.value) {
          filteredDoctors = filteredDoctors.filter((doctor) => {
            // Check if doctor has Doctor_Info with specialtyId matching selectedSpecialty
            return (
              doctor.Doctor_Info &&
              doctor.Doctor_Info.specialtyId === selectedSpecialty.value
            );
          });
        }

        // Filter by clinic
        if (selectedClinic && selectedClinic.value) {
          filteredDoctors = filteredDoctors.filter((doctor) => {
            // Check if doctor has Doctor_Info with clinicId matching selectedClinic
            return (
              doctor.Doctor_Info &&
              doctor.Doctor_Info.clinicId === selectedClinic.value
            );
          });
        }

        let doctorOptions = filteredDoctors.map((item) => ({
          value: item.id,
          label:
            language === LANGUAGES.VI
              ? `${item.lastName} ${item.firstName}`
              : `${item.firstName} ${item.lastName}`,
          data: item,
        }));

        this.setState({ doctors: doctorOptions });
      }
    } catch (e) {
      console.log('Error loading doctors:', e);
    }
  };

  loadTimeSlots = async () => {
    try {
      let { selectedDoctor, selectedDate } = this.state;
      if (!selectedDoctor || !selectedDate) return;

      let dateTimestamp = new Date(selectedDate).getTime();
      let res = await getScheduleDoctorByDate(
        selectedDoctor.value,
        dateTimestamp
      );

      if (res && res.errCode === 0 && res.data) {
        let { language } = this.props;
        let timeOptions = res.data.map((item) => ({
          value: item.timeType,
          label:
            language === LANGUAGES.VI
              ? item.timeTypeData.valueVi
              : item.timeTypeData.valueEn,
          data: item,
        }));
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
        // If date is chosen, reload doctors for new filters
        if (this.state.selectedDate) {
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
        // If date is chosen, reload doctors for new filters
        if (this.state.selectedDate) {
          this.loadDoctors();
        }
      }
    );
  };

  handleSelectDate = (date) => {
    // Reset doctor and times on date change, then reload doctors
    this.setState(
      {
        selectedDate: date[0],
        selectedDoctor: null,
        timeSlots: [],
        selectedTime: null,
      },
      () => {
        this.loadDoctors();
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
    let valueInput = event.target.value;
    let stateCopy = { ...this.state };
    stateCopy[id] = valueInput;
    this.setState({ ...stateCopy });
  };

  handleOnDatePicker = (date) => {
    this.setState({ birthday: date[0] });
  };

  handleChangeGender = (selectedOption) => {
    this.setState({ selectedGender: selectedOption });
  };

  nextStep = () => {
    let { currentStep, totalSteps } = this.state;

    // Validate dữ liệu trước khi nhảy bước
    if (currentStep === 1 && !this.state.selectedSpecialty) {
      toast.error('Vui lòng chọn chuyên khoa!');
      return;
    }
    if (currentStep === 2 && !this.state.selectedClinic) {
      toast.error('Vui lòng chọn cơ sở y tế!');
      return;
    }
    if (currentStep === 3 && !this.state.selectedDate) {
      toast.error('Vui lòng chọn ngày khám!');
      return;
    }
    if (currentStep === 4) {
      if (!this.state.selectedDoctor) {
        toast.error('Vui lòng chọn bác sĩ!');
        return;
      }
      if (this.state.timeSlots.length === 0) {
        toast.error('Hôm nay bác sĩ không có lịch khám!');
        return;
      }
      if (!this.state.selectedTime) {
        toast.error('Vui lòng chọn giờ khám!');
        return;
      }
    }

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
    // Validate
    if (!this.state.selectedSpecialty) {
      toast.error('Vui lòng chọn chuyên khoa!');
      return;
    }
    if (!this.state.selectedClinic) {
      toast.error('Vui lòng chọn cơ sở y tế!');
      return;
    }
    if (!this.state.selectedDate) {
      toast.error('Vui lòng chọn ngày khám!');
      return;
    }
    if (!this.state.selectedDoctor) {
      toast.error('Vui lòng chọn bác sĩ!');
      return;
    }
    if (!this.state.selectedTime) {
      toast.error('Vui lòng chọn giờ khám!');
      return;
    }
    if (!this.state.fullName || !this.state.phoneNumber || !this.state.email) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    this.setState({ isShowLoading: true });

    try {
      let birthday = new Date(this.state.birthday).getTime();
      let date = new Date(this.state.selectedDate).getTime();
      let { language } = this.props;

      let timeString =
        language === LANGUAGES.VI
          ? this.state.selectedTime.data.timeTypeData.valueVi
          : this.state.selectedTime.data.timeTypeData.valueEn;

      timeString += ' - ';
      timeString +=
        language === LANGUAGES.VI
          ? moment.unix(date / 1000).format('dddd - DD/MM/YYYY')
          : moment
              .unix(date / 1000)
              .locale('en')
              .format('dddd - DD/MM/YYYY');

      let doctorName =
        language === LANGUAGES.VI
          ? `${this.state.selectedDoctor.data.lastName} ${this.state.selectedDoctor.data.firstName}`
          : `${this.state.selectedDoctor.data.firstName} ${this.state.selectedDoctor.data.lastName}`;

      let res = await postPatientBookAppointment({
        fullName: this.state.fullName,
        phoneNumber: this.state.phoneNumber,
        email: this.state.email,
        address: this.state.address,
        reason: this.state.reason,
        date: date,
        birthday: birthday,
        selectedGender: this.state.selectedGender.value,
        doctorId: this.state.selectedDoctor.value,
        timeType: this.state.selectedTime.value,
        language: language,
        timeString: timeString,
        doctorName: doctorName,
      });

      this.setState({ isShowLoading: false });

      if (res && res.errCode === 0) {
        toast.success('Đặt lịch khám nhanh thành công!');
        this.props.closeModal();
        this.resetForm();
      } else {
        toast.error('Đặt lịch khám thất bại! ' + res.errMessage);
      }
    } catch (e) {
      this.setState({ isShowLoading: false });
      toast.error('Có lỗi xảy ra!');
      console.log('Error booking:', e);
    }
  };

  resetForm = () => {
    this.setState({
      currentStep: 1,
      selectedSpecialty: null,
      selectedClinic: null,
      selectedDate: '',
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
      selectedGender: '',
    });
  };

  renderStepIndicator = () => {
    let { currentStep, totalSteps } = this.state;
    let steps = [
      { number: 1, label: 'Chuyên khoa' },
      { number: 2, label: 'Cơ sở' },
      { number: 3, label: 'Ngày' },
      { number: 4, label: 'Bác sĩ & Giờ' },
      { number: 5, label: 'Thông tin' },
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
        return this.renderDateStep();
      case 4:
        return this.renderDoctorStep();
      case 5:
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
          <div
            className="clinic-info"
            style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
            }}
          >
            <p>
              <strong>Thông tin cơ sở:</strong>
            </p>
            <p>
              <strong>Tên cơ sở:</strong>{' '}
              {this.state.selectedClinic.data.name}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {this.state.selectedClinic.data.name}
            </p>
          </div>
        )}
      </div>
    );
  };

  renderDateStep = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="step-content">
        <h4 className="step-title">
          <i className="fas fa-calendar-alt"></i> Chọn ngày khám
        </h4>
        <p className="step-description">Bạn muốn đặt lịch vào ngày nào?</p>
        <DatePicker
          onChange={this.handleSelectDate}
          className="form-control date-picker-quick"
          value={this.state.selectedDate}
          placeholder="Chọn ngày khám..."
          minDate={today}
        />
      </div>
    );
  };

  renderDoctorStep = () => {
    const { selectedDoctor, doctors, timeSlots, selectedTime } = this.state;
    const { language } = this.props;

    return (
      <div className="step-content">
        <h4 className="step-title">
          <i className="fas fa-user-md"></i> Chọn bác sĩ
        </h4>
        <p className="step-description">Chọn bác sĩ bạn muốn khám</p>
        <Select
          value={selectedDoctor}
          onChange={this.handleSelectDoctor}
          options={doctors}
          placeholder="Chọn bác sĩ..."
          className="select-doctor"
          isLoading={doctors.length === 0}
        />

        {/* Hiển thị thông báo khi không có bác sĩ nào thoả mãn */}
        {!selectedDoctor && doctors.length === 0 && (
          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
              color: '#856404',
            }}
          >
            <p>
              <i className="fas fa-info-circle"></i> Không có bác sĩ nào thoả
              mãn điều kiện
            </p>
          </div>
        )}

        {/* Hiển thị giá khám khi đã chọn bác sĩ */}
        {selectedDoctor &&
          selectedDoctor.data &&
          selectedDoctor.data.Doctor_Info && (
            <div
              style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#e8f4f8',
                border: '1px solid #b3e5fc',
                borderRadius: '4px',
              }}
            >
              <p>
                <strong>
                  {language === LANGUAGES.VI
                    ? 'Giá khám: '
                    : 'Examination Fee: '}
                </strong>
                <span
                  style={{
                    color: '#d32f2f',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {selectedDoctor.data.Doctor_Info.priceTypeData &&
                  language === LANGUAGES.VI
                    ? selectedDoctor.data.Doctor_Info.priceTypeData.valueVi +
                      ' VND'
                    : selectedDoctor.data.Doctor_Info.priceTypeData &&
                      language === LANGUAGES.EN
                    ? selectedDoctor.data.Doctor_Info.priceTypeData.valueEn +
                      ' $'
                    : 'N/A'}
                </span>
              </p>
            </div>
          )}

        {/* Khi chọn bác sĩ nhưng có timeSlots */}
        {selectedDoctor && timeSlots.length > 0 && (
          <div className="time-slots-section" style={{ marginTop: '15px' }}>
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
                  style={{
                    cursor: 'pointer',
                    padding: '10px',
                    margin: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}
                >
                  <i className="far fa-clock"></i> {time.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Khi chọn bác sĩ nhưng không có timeSlots */}
        {selectedDoctor && timeSlots.length === 0 && (
          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              color: '#721c24',
            }}
          >
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
          {this.state.selectedDoctor?.data?.Doctor_Info?.priceTypeData && (
            <div className="summary-item">
              <strong>Giá khám:</strong>{' '}
              {this.props.language === LANGUAGES.VI
                ? `${this.state.selectedDoctor.data.Doctor_Info.priceTypeData.valueVi} VND`
                : `${this.state.selectedDoctor.data.Doctor_Info.priceTypeData.valueEn} $`}
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
              onChange={(event) => this.handleOnChangeInput(event, 'fullName')}
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="col-6 form-group">
            <label>
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              className="form-control"
              value={this.state.phoneNumber}
              onChange={(event) =>
                this.handleOnChangeInput(event, 'phoneNumber')
              }
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="col-6 form-group">
            <label>
              Email <span className="required">*</span>
            </label>
            <input
              className="form-control"
              value={this.state.email}
              onChange={(event) => this.handleOnChangeInput(event, 'email')}
              placeholder="Nhập email"
            />
          </div>

          <div className="col-6 form-group">
            <label>Địa chỉ</label>
            <input
              className="form-control"
              value={this.state.address}
              onChange={(event) => this.handleOnChangeInput(event, 'address')}
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div className="col-6 form-group">
            <label>Ngày sinh</label>
            <DatePicker
              onChange={this.handleOnDatePicker}
              className="form-control"
              value={this.state.birthday}
              placeholder="Chọn ngày sinh"
            />
          </div>

          <div className="col-6 form-group">
            <label>Giới tính</label>
            <Select
              value={this.state.selectedGender}
              onChange={this.handleChangeGender}
              options={this.state.genders}
              placeholder="Chọn giới tính"
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
                <p>Chỉ 5 bước đơn giản để đặt lịch khám bệnh</p>
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

              {this.state.currentStep < 5 && (
                <button className="btn-next" onClick={this.nextStep}>
                  Tiếp tục <i className="fas fa-arrow-right"></i>
                </button>
              )}

              {this.state.currentStep === 5 && (
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
    genders: state.admin.genders,
    isLoggedIn: state.user && state.user.isLoggedIn,
    userInfo: state.user && state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getGenders: () => dispatch(actions.fetchGenderStart()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(QuickBookingModal)
);
