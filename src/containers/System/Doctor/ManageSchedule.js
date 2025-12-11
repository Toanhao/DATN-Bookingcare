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
import { saveBulkScheduleDoctor } from '../../../services/userService';

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

  componentDidMount() {
    // await this.getAllDoctor();
    this.props.fetchAllDoctors();
    this.props.fetchAllScheduleTime();
    
    // Nếu là bác sĩ đăng nhập, tự động set selectedDoctor là chính mình
    let { userInfo } = this.props;
    if (userInfo && userInfo.roleId === USER_ROLE.DOCTOR) {
      let labelVi = `${userInfo.lastName} ${userInfo.firstName}`;
      let labelEn = `${userInfo.firstName} ${userInfo.lastName}`;
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

    if (prevProps.allScheduleTime !== this.props.allScheduleTime) {
      let data = this.props.allScheduleTime;
      if (data && data.length > 0) {
        // data.map(item => {
        //   item.isSelected = false;
        //   return item;
        // })
        data = data.map((item) => ({ ...item, isSelected: false }));
      }

      this.setState({
        rangeTime: data,
      });
    }
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
        let labelVi = `${item.lastName} ${item.firstName}`;
        let labelEn = `${item.firstName} ${item.lastName}`;
        object.label = language === LANGUAGES.VI ? labelVi : labelEn;
        object.value = item.id;
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
    console.log('onClickBtnTime', time);
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

    //let formatedDate = moment(currentDate).format(dateFormat.SEND_TO_SERVER);
    // let formatedDate = moment(currentDate).unix()
    let formatedDate = new Date(currentDate).getTime();

    if (rangeTime && rangeTime.length > 0) {
      let selectedTime = rangeTime.filter((item) => item.isSelected === true);
      if (selectedTime && selectedTime.length > 0) {
        selectedTime.map((schedule, index) => {
          console.log('check selected time', schedule, index, selectedDoctor);
          let object = {};
          object.doctorId = selectedDoctor.value; //value: label
          object.date = formatedDate;
          object.timeType = schedule.keyMap;
          return result.push(object);
        });
      } else {
        toast.error('Thời gian được chọn không hợp lệ!');
        return;
      }
    }
    let res = await saveBulkScheduleDoctor({
      arrSchedule: result,
      doctorId: selectedDoctor.value,
      date: formatedDate,
    });
    if (res && res.errCode === 0) {
      toast.success('Lưu thông tin thành công!');
    } else {
      toast.error('Lưu thông tin thất bại!');
      console.log('error', res);
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
            {this.props.userInfo && this.props.userInfo.roleId === USER_ROLE.ADMIN && (
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
            <div className={this.props.userInfo && this.props.userInfo.roleId === USER_ROLE.DOCTOR ? "col-12 form-group" : "col-6 form-group"}>
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
                      {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
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
    allScheduleTime: state.admin.allScheduleTime,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
    fetchAllScheduleTime: () => dispatch(actions.fetchAllScheduleTime()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
