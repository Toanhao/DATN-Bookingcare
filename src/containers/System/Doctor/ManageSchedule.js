/** @format */

import { Component } from 'react';
import { connect } from 'react-redux';
import './ManageSchedule.scss';
import { FormattedMessage } from 'react-intl';
import * as actions from '../../../store/actions';
import Select from 'react-select';
import { LANGUAGES, USER_ROLE } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import moment from 'moment';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { createScheduleBulkNew, getTimeSlots } from '../../../services/userService';

// import Header from "../containers/Header/Header";

class ManageSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listDoctors: [],
      selectedDoctor: {},
      currentDate: '',
      rangeTime: [],
      minDate: moment().subtract(1, 'days'),
    };
  }

  async componentDidMount()  {
    // await this.getAllDoctor();
    this.props.fetchAllDoctors();
    // Load timeslots from new backend
    try {
      const res = await getTimeSlots();
      const data = (res && res.data) || res; // axios interceptor returns data
      let rangeTime = Array.isArray(data)
        ? data.map((t) => ({ ...t, isSelected: false }))
        : [];
      this.setState({ rangeTime });
    } catch (e) {
      this.setState({ rangeTime: [] });
    }
    
    // Nếu là bác sĩ đăng nhập, tự động set selectedDoctor là chính mình
    let { userInfo } = this.props;
    if (userInfo && userInfo.role === 'DOCTOR') {
      const name = userInfo.fullName || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim();
      let labelVi = name;
      let labelEn = name;
      let selectedDoctor = {
        label: this.props.language === LANGUAGES.VI ? labelVi : labelEn,
        value: userInfo.id
      };
      this.setState({
        selectedDoctor: selectedDoctor
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.allDoctors !== this.props.allDoctors) {
      let dataSelect = this.buildDataInputSelect(this.props.allDoctors);
      this.setState({
        listDoctors: dataSelect,
      });
    }

    // timeslots loaded once on mount; no redux updates here
    // if (prevProps.language !== this.props.language) {
    //   let dataSelect = this.buildDataInputSelect(this.props.language);
    //   this.setState({
    //     listDoctors: dataSelect,
    //   });
    // }
  }

  buildDataInputSelect = (inputData) => {
    let result = [];
    let { language } = this.props;
    if (inputData && inputData.length > 0) {
      inputData.map((item, index) => {
        console.log('item', item);
        let object = {};
        // Backend mới trả về doctor với user.fullName
        if (item.user && item.user.fullName) {
          object.label = item.user.fullName;
          object.value = item.id;
        } else if (item.firstName && item.lastName) {
          // Fallback cho format cũ
          let labelVi = `${item.lastName} ${item.firstName}`;
          let labelEn = `${item.firstName} ${item.lastName}`;
          object.label = language === LANGUAGES.VI ? labelVi : labelEn;
          object.value = item.id;
        }
        return result.push(object);
      });
    }
    return result;
  };

  handleChangeSelect = async (selectedDoctor) => {
    this.setState({ selectedDoctor: selectedDoctor });
  };

  handleOnChangeDatePicker = (date) => {
    this.setState({
      currentDate: date[0],
    });
  };

  handleClickBtnTime = (time) => {
    let { rangeTime } = this.state;
    if (rangeTime && rangeTime.length > 0) {
      rangeTime = rangeTime.map((item) => {
        if (item.id === time.id) item.isSelected = !item.isSelected;
        return item;
      });
      this.setState({
        rangeTime: rangeTime,
      });
    }
  };

  handleSaveSchedule = async () => {
    let { rangeTime, selectedDoctor, currentDate } = this.state;
    let result = [];

    if (!currentDate) {
      toast.error('Ngày không hợp lệ!');
      return;
    }

    if (selectedDoctor && _.isEmpty(selectedDoctor)) {
      toast.error('Bác sĩ được chọn không hợp lệ!');
      return;
    }

    // Backend expects a date (DATE type); use ISO string
    let formatedDate = new Date(currentDate).toISOString();

    if (rangeTime && rangeTime.length > 0) {
      let selectedTime = rangeTime.filter((item) => item.isSelected === true);
      if (selectedTime && selectedTime.length > 0) {
        const ids = selectedTime.map((s) => s.id);
        result = ids;
      } else {
        toast.error('Thời gian được chọn không hợp lệ!');
        return;
      }
    }
    try {
      const payload = {
        doctorId: selectedDoctor.value,
        workDate: formatedDate,
        timeSlotIds: result,
        maxPatient: 20,
      };
      const res = await createScheduleBulkNew(payload);
      if (res && (res.createdCount || res.schedules)) {
        toast.success('Lưu thông tin thành công!');
      } else {
        toast.success('Lưu thông tin thành công!');
      }
    } catch (e) {
      toast.error(e?.message || 'Lưu thông tin thất bại!');
    }
  };
  render() {
    let { rangeTime } = this.state;
    let { language } = this.props;
    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    return (
      <div className="manage-schedule-container">
        <div className="m-s-title">
          <FormattedMessage id="manage-schedule.title" />
        </div>

        <div className="container">
          <div className="row">
            {/* Chỉ hiển thị dropdown chọn bác sĩ nếu là Admin */}
            {this.props.userInfo && this.props.userInfo.role === USER_ROLE.ADMIN && (
              <div className="col-6 form-group ">
                <label>
                  <FormattedMessage id="manage-schedule.choose-doctor" />
                </label>
                <Select
                  value={this.state.selectedDoctor}
                  onChange={this.handleChangeSelect}
                  options={this.state.listDoctors}
                />
              </div>
            )}
            <div className={this.props.userInfo && this.props.userInfo.role === USER_ROLE.DOCTOR ? "col-12 form-group" : "col-6 form-group"}>
              <label>
                <FormattedMessage id="manage-schedule.choose-date" />
              </label>
              <DatePicker
                onChange={this.handleOnChangeDatePicker}
                className="form-control"
                value={this.state.currentDate}
                minDate={yesterday}
              />
            </div>
            <div className="col-12 pick-hour-container">
              {rangeTime &&
                rangeTime.length > 0 &&
                rangeTime.map((item, index) => {
                  return (
                    <button
                      className={
                        item.isSelected === true
                          ? 'btn btn-schedule active'
                          : 'btn btn-schedule'
                      }
                      key={index}
                      onClick={() => this.handleClickBtnTime(item)}
                    >
                      {item.label}
                    </button>
                  );
                })}
            </div>
            <div className="col-12">
              <button
                className="btn btn-primary btn-save-schedule"
                onClick={() => this.handleSaveSchedule()}
              >
                <FormattedMessage id="manage-schedule.save" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
    allDoctors: state.admin.allDoctors,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
