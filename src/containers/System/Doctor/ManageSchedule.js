/** @format */

import { Component } from 'react';
import { connect } from 'react-redux';
import './ManageSchedule.scss';
import { FormattedMessage } from 'react-intl';
import * as actions from '../../../store/actions';
import Select from 'react-select';
import { USER_ROLE } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import moment from 'moment';
import { toast } from 'react-toastify';
import { createScheduleBulkNew, getTimeSlots, getSchedules } from '../../../services/userService';

// import Header from "../containers/Header/Header";

class ManageSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listDoctors: [],
      selectedDoctor: {},
      currentDate: new Date(),
      rangeTime: [],
      maxPatient: 2,
      loadingSlots: false,
      minDate: "today",
    };
  }

  async componentDidMount() {
    this.props.fetchAllDoctors();
    
    try {
      this.setState({ loadingSlots: true });
      const res = await getTimeSlots();
      const timeSlots = (res?.data) || res;
      const rangeTime = Array.isArray(timeSlots)
        ? timeSlots.map((t) => ({ ...t, isSelected: false }))
        : [];
      this.setState({ rangeTime });
    } catch (e) {
      this.setState({ rangeTime: [] });
    } finally {
      this.setState({ loadingSlots: false });
    }
    
    // Auto-select doctor for DOCTOR role
    const { userInfo } = this.props;
    if (userInfo?.role === 'DOCTOR') {
      const name = userInfo.fullName ;
      this.setState({
        selectedDoctor: {
          label: name,
          value: userInfo.id,
        },
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

    // When doctor or date changes and we have slots, refresh existed slots
    const doctorChanged = prevState.selectedDoctor?.value !== this.state.selectedDoctor?.value;
    const dateChanged = !moment(prevState.currentDate).isSame(this.state.currentDate, 'day');
    if ((doctorChanged || dateChanged) && this.state.selectedDoctor?.value) {
      this.refreshExistedSlots();
    }
  }

  buildDataInputSelect = (inputData) => {
    if (!inputData || inputData.length === 0) return [];
    
    return inputData.reduce((result, item) => {
      let object = {};
      if (item.user?.fullName) {
        object = {
          label: item.user.fullName,
          value: item.id,
        };
      }
      if (object.value) result.push(object);
      return result;
    }, []);
  };

  handleChangeSelect = (selectedDoctor) => {
    this.setState({ selectedDoctor });
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

  refreshExistedSlots = async () => {
    const { selectedDoctor, currentDate, rangeTime } = this.state;
    if (!selectedDoctor?.value || !currentDate || !Array.isArray(rangeTime)) return;

    const workDate = moment(currentDate).format('YYYY-MM-DD');
    try {
      const res = await getSchedules(selectedDoctor.value, workDate);
      const schedules = (res?.data) || res;
      const existedSlotIds = Array.isArray(schedules) 
        ? schedules.map((s) => s.timeSlotId) 
        : [];
      
      const updated = rangeTime.map((t) => ({
        ...t,
        isSelected: existedSlotIds.includes(t.id),
      }));
      this.setState({ rangeTime: updated });
    } catch (e) {
      // On error, clear all selections
      const updated = rangeTime.map((t) => ({ ...t, isSelected: false }));
      this.setState({ rangeTime: updated });
    }
  };

  handleSelectAll = () => {
    const updated = this.state.rangeTime.map((t) => ({
      ...t,
      isSelected: true,
    }));
    this.setState({ rangeTime: updated });
  };

  handleClear = () => {
    const updated = this.state.rangeTime.map((t) => ({
      ...t,
      isSelected: false,
    }));
    this.setState({ rangeTime: updated });
  };

  handleSaveSchedule = async () => {
    const { rangeTime, selectedDoctor, currentDate, maxPatient } = this.state;

    // Validation
    if (!currentDate) {
      toast.error('Ngày không hợp lệ!');
      return;
    }

    if (!selectedDoctor?.value) {
      toast.error('Bác sĩ được chọn không hợp lệ!');
      return;
    }

    if (!maxPatient || Number.isNaN(Number(maxPatient)) || Number(maxPatient) <= 0) {
      toast.error('Số bệnh nhân tối đa không hợp lệ!');
      return;
    }

    const selectedIds = rangeTime
      .filter((item) => item.isSelected)
      .map((s) => s.id);

    try {
      const payload = {
        doctorId: selectedDoctor.value,
        workDate: moment(currentDate).format('YYYY-MM-DD'),
        timeSlotIds: selectedIds,
        maxPatient: Number(maxPatient),
      };
      await createScheduleBulkNew(payload);
      
      const message = selectedIds.length === 0 
        ? 'Đã xóa hết lịch của ngày này!'
        : 'Lưu thông tin thành công!';
      toast.success(message);
      
      await this.refreshExistedSlots();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Lưu thông tin thất bại!');
    }
  };
  render() {
    let { rangeTime, maxPatient, loadingSlots } = this.state;
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
                minDate='today'
              />
            </div>
            <div className="col-6 form-group">
              <label>
                Số bệnh nhân tối đa/khung giờ
              </label>
              <input
                className="form-control"
                type="number"
                min={1}
                value={maxPatient}
                onChange={(e) => this.setState({ maxPatient: e.target.value })}
              />
            </div>
            <div className="col-12 pick-hour-container">
              <div className="mb-2 d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={this.handleSelectAll} disabled={loadingSlots || rangeTime.length === 0}>
                  Chọn tất cả
                </button>
                <button className="btn btn-outline-secondary" onClick={this.handleClear} disabled={loadingSlots || rangeTime.length === 0}>
                  Bỏ chọn
                </button>
              </div>
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
