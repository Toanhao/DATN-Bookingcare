/** @format */

import { Component } from 'react';
import { connect } from 'react-redux';
import './TableManageUser.scss';
import * as actions from '../../../store/actions';
import './ManageDoctor.scss';
import MarkDownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
import { getDetailInforDoctor } from '../../../services/userService';
import { CRUD_ACTIONS, LANGUAGES } from '../../../utils';
import { toast } from 'react-toastify';

const mdParser = new MarkDownIt(/* Markdown-it options */);

class ManageDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentMarkdown: '',
      contentHTML: '',
      selectedDoctor: '',
      description: '',
      listDoctors: [],
      hasOldData: false,

      //doctor Infor
      listClinic: [],
      listSpecialty: [],

      selectedClinic: '',
      selectedSpecialty: '',

      fee: '', // Nhập trực tiếp giá khám
    };
  }

  async componentDidMount() {
    this.props.getAllRequiredDoctorInfor();
    this.props.fetchAllDoctorsUser(); // Lấy danh sách doctors (users role DOCTOR)
  }

  buildDataInputSelect = (inputData, type) => {
    if (!Array.isArray(inputData) || inputData.length === 0) return [];

    switch (type) {
      case 'DOCTORS':
        return inputData
          .filter((item) => item.fullName || (item.user && item.user.fullName))
          .map((item) => ({
            label: item.fullName || item.user.fullName,
            value: item.id,
          }));
      case 'SPECIALTY':
        return inputData.map((item) => ({
          label: item.name,
          value: item.id,
        }));
      case 'CLINIC':
        return inputData.map((item) => ({
          label: item.name,
          value: item.id,
        }));
      default:
        return [];
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.allDoctors !== this.props.allDoctors) {
      let dataSelect = this.buildDataInputSelect(
        this.props.allDoctors,
        'DOCTORS'
      );
      this.setState({
        listDoctors: dataSelect,
      });
    }

    if (
      prevProps.allRequiredDoctorInfor !== this.props.allRequiredDoctorInfor
    ) {
      let { resSpecialty, resClinic } = this.props.allRequiredDoctorInfor;

      let dataSelectSpecialty = this.buildDataInputSelect(
        resSpecialty,
        'SPECIALTY'
      );
      let dataSelectClinic = this.buildDataInputSelect(resClinic, 'CLINIC');

      this.setState({
        listSpecialty: dataSelectSpecialty,
        listClinic: dataSelectClinic,
      });
    }
  }

  handleEditorChange = ({ html, text }) => {
    this.setState({
      contentMarkdown: text,
      contentHTML: html,
    });
  };

  handleSaveContentMarkdown = () => {
    let { hasOldData, selectedDoctor, description, contentMarkdown, fee, selectedClinic, selectedSpecialty } = this.state;

    // Validate
    if (!selectedDoctor || !selectedDoctor.value) {
      toast.error('Vui lòng chọn bác sĩ!');
      return;
    }
    if (!selectedClinic || !selectedClinic.value) {
      toast.error('Vui lòng chọn phòng khám!');
      return;
    }
    if (!selectedSpecialty || !selectedSpecialty.value) {
      toast.error('Vui lòng chọn chuyên khoa!');
      return;
    }
    if (!fee || parseFloat(fee) <= 0) {
      toast.error('Vui lòng nhập giá khám hợp lệ!');
      return;
    }
    if (!this.state.contentHTML || !this.state.contentHTML.trim()) {
      toast.error('Vui lòng nhập tiểu sử bác sĩ!');
      return;
    }

    const dataToSend = {
      id: selectedDoctor.value, // userId - FK trong bảng Doctor
      title: description || 'Bác sĩ',
      bio: this.state.contentHTML || '',
      fee: parseFloat(fee),
      clinicId: selectedClinic.value,
      specialtyId: selectedSpecialty.value,
      action: hasOldData === true ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,
    };

    this.props.saveDetailDoctor(dataToSend);
  };

  handleChangeSelect = async (selectedDoctor) => {
    this.setState({ selectedDoctor });
    let { listSpecialty, listClinic } = this.state;

    // Reset all fields first
    this.setState({
      contentHTML: '',
      contentMarkdown: '',
      description: '',
      hasOldData: false,
      fee: '',
      selectedSpecialty: '',
      selectedClinic: '',
    });

    // Thử load thông tin doctor nếu đã tồn tại trong bảng Doctor
    try {
      let res = await getDetailInforDoctor(selectedDoctor.value);
      if (res && res.errCode === 0 && res.data) {
        const doctor = res.data;
        
        let selectedSpecialty = listSpecialty.find((item) => item && item.value === doctor.specialtyId);
        let selectedClinic = listClinic.find((item) => item && item.value === doctor.clinicId);

        this.setState({
          contentMarkdown: doctor.bio || '',
          description: doctor.title || '',
          hasOldData: true,
          fee: doctor.fee ? doctor.fee.toString() : '',
          selectedSpecialty: selectedSpecialty,
          selectedClinic: selectedClinic,
        });
      } else {
        // Nếu API không trả về data (user chưa tạo doctor record), giữ nguyên trạng thái reset
        console.log('User mới, chưa tạo doctor record');
      }
    } catch (error) {
      // Nếu chưa có thông tin doctor (tạo mới), giữ nguyên trạng thái reset
      console.log('User mới, tạo doctor mới');
    }
  };

  handleChangeSelectDoctorInfor = async (selectedDoctor, name) => {
    let stateName = name.name;
    let stateCopy = { ...this.state };
    stateCopy[stateName] = selectedDoctor;
    this.setState({ ...stateCopy });

    // console.log(`Option selected:`, selectedDoctor);
  };

  handleOnChangeDesc = (event, id) => {
    let stateCopy = { ...this.state };
    stateCopy[id] = event.target.value;
    this.setState({
      ...stateCopy,
    });
  };

  handleOnChangeFee = (event) => {
    const value = event.target.value;
    // Chỉ cho phép nhập số
    if (value === '' || /^\d+$/.test(value)) {
      this.setState({ fee: value });
    }
  };
  render() {
    let { hasOldData } = this.state;
    return (
      <div className="manage-doctor-container">
        <div className="manage-doctor-title">
          <FormattedMessage id="admin.manage-doctor.title" />
        </div>
        <div className="more-Infor">
          <div className="content-left form-group">
            <label>
              <FormattedMessage id="admin.manage-doctor.select-doctor" />
            </label>
            <Select
              value={this.state.selectedDoctor}
              onChange={this.handleChangeSelect}
              options={this.state.listDoctors}
              placeholder={
                <FormattedMessage id="admin.manage-doctor.select-doctor" />
              }
            />
          </div>
          <div className="content-right ">
            <label>
              <FormattedMessage id="admin.manage-doctor.intro" />
            </label>
            <textarea
              onChange={(event) =>
                this.handleOnChangeDesc(event, 'description')
              }
              value={this.state.description}
              className="form-control"
              rows="4"
            ></textarea>
          </div>
        </div>
        <div className="more-Infor-extra row">
          <div className="col-4 form-group">
            <label>
              <FormattedMessage id="admin.manage-doctor.specialty" />
            </label>
            <Select
              value={this.state.selectedSpecialty}
              onChange={this.handleChangeSelectDoctorInfor}
              options={this.state.listSpecialty}
              placeholder={
                <FormattedMessage id="admin.manage-doctor.specialty" />
              }
              name="selectedSpecialty"
            />
          </div>
          <div className="col-4 form-group">
            <label>
              <FormattedMessage id="admin.manage-doctor.select-clinic" />
            </label>
            <Select
              value={this.state.selectedClinic}
              onChange={this.handleChangeSelectDoctorInfor}
              options={this.state.listClinic}
              placeholder={
                <FormattedMessage id="admin.manage-doctor.select-clinic" />
              }
              name="selectedClinic"
            />
          </div>
          <div className="col-4 form-group">
            <label>
              Giá khám (VNĐ)
            </label>
            <input
              className="form-control"
              type="text"
              onChange={this.handleOnChangeFee}
              value={this.state.fee}
              placeholder="Ví dụ: 500000"
            />
          </div>
        </div>

        <div className="manage-doctor-editor">
          <MdEditor
            style={{ height: '500px' }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={this.handleEditorChange}
            value={this.state.contentMarkdown}
          />
        </div>

        <button
          onClick={() => this.handleSaveContentMarkdown()}
          className={
            hasOldData === true
              ? 'save-content-doctor'
              : 'create-content-doctor'
          }
        >
          {hasOldData === true ? (
            <span>
              <FormattedMessage id="admin.manage-doctor.save" />
            </span>
          ) : (
            <span>
              <FormattedMessage id="admin.manage-doctor.add" />
            </span>
          )}
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    allDoctors: state.admin.allDoctors,
    language: state.app.language,
    allRequiredDoctorInfor: state.admin.allRequiredDoctorInfor,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctorsUser: () => dispatch(actions.fetchAllDoctorsUser()),
    saveDetailDoctor: (data) => dispatch(actions.saveDetailDoctor(data)),
    getAllRequiredDoctorInfor: () => dispatch(actions.getRequiredDoctorInfor()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
