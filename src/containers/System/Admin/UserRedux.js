import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { LANGUAGES, CRUD_ACTIONS, CommonUtils } from '../../../utils';
import * as actions from '../../../store/actions';
import './UserRedux.scss';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import TableManageUser from './TableManageUser';
import { Buffer } from 'buffer';

class UserRedux extends Component {
  constructor(props) {
    super(props);
    this.state = {
      genderArr: [],
      roleArr: [],
      previewImgURL: '',
      isOpen: false,

      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      address: '',
      gender: '',
      role: '',
      avatar: '',
      action: '',
      userEditId: '',
    };
  }

  async componentDidMount() {
    // Static options since allcode removed in backend
    const genders = [
      { keyMap: 'Nam', valueVi: 'Nam', valueEn: 'Male' },
      { keyMap: 'Nữ', valueVi: 'Nữ', valueEn: 'Female' },
      { keyMap: 'Khác', valueVi: 'Khác', valueEn: 'Other' },
    ];
    const roles = [
      { keyMap: 'ADMIN', valueVi: 'Quản trị', valueEn: 'Admin' },
      { keyMap: 'DOCTOR', valueVi: 'Bác sĩ', valueEn: 'Doctor' },
      { keyMap: 'PATIENT', valueVi: 'Bệnh nhân', valueEn: 'Patient' },
    ];
    this.setState({
      genderArr: genders,
      roleArr: roles,
      gender: genders[0].keyMap,
      role: roles[2].keyMap,
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Reset form when user list changes; use local static options
    if (prevProps.listUsers !== this.props.listUsers) {
      const { genderArr, roleArr } = this.state;
      this.setState({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        role: roleArr && roleArr.length > 0 ? roleArr[0].keyMap : '',
        gender: genderArr && genderArr.length > 0 ? genderArr[0].keyMap : '',
        avatar: '',
        action: CRUD_ACTIONS.CREATE,
        previewImgURL: '',
      });
    }
  }

  handleOnChangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let base64 = await CommonUtils.getBase64(file);
      let objectUrl = URL.createObjectURL(file);
      this.setState({
        previewImgURL: objectUrl,
        avatar: base64,
      });
    }
  };

  openPreviewImage = () => {
    if (!this.state.previewImgURL) return;
    this.setState({
      isOpen: true,
    });
  };

  handleSaveUser = () => {
    let isValid = this.checkValidateInput();
    if (isValid === false) return;

    let { action } = this.state;
    //fire redux action
    if (action === CRUD_ACTIONS.CREATE) {
      this.props.createNewUser({
        email: this.state.email,
        password: this.state.password,
        fullName: this.state.fullName,
        address: this.state.address,
        phoneNumber: this.state.phoneNumber,
        gender: this.state.gender,
        role: this.state.role,
        avatar: this.state.avatar,
      });
    }
    if (action === CRUD_ACTIONS.EDIT) {
      this.props.editAUserRedux({
        id: this.state.userEditId,
        email: this.state.email,
        password: this.state.password,
        fullName: this.state.fullName,
        address: this.state.address,
        phoneNumber: this.state.phoneNumber,
        gender: this.state.gender,
        role: this.state.role,
        avatar: this.state.avatar,
      });
    }
  };

  checkValidateInput = () => {
    let isValid = true;
    let arrCheck = [
      'email',
      'password',
      'fullName',
      'phoneNumber',
      'address',
    ];
    for (let i = 0; i < arrCheck.length; i++) {
      if (!this.state[arrCheck[i]]) {
        isValid = false;
        alert('This input is required: ' + arrCheck[i]);
        break;
      }
    }
    return isValid;
  };

  onChangeInput = (event, id) => {
    let copyState = { ...this.state };

    copyState[id] = event.target.value;
    this.setState({
      ...copyState,
    });
  };

  handleEditUserFromParent = (user) => {
    let imageBase64 = '';
    if (user.image) {
      imageBase64 = new Buffer(user.image, 'base64').toString('binary');
    }
    this.setState({
      email: user.email,
      password: 'HARDCODE',
      fullName: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' '),
      phoneNumber: user.phoneNumber,
      address: user.address,
      role: user.role,
      gender: user.gender,
      avatar: '',
      previewImgURL: imageBase64,
      action: CRUD_ACTIONS.EDIT,
      userEditId: user.id,
    });
  };

  render() {
    let genders = this.state.genderArr;
    let roles = this.state.roleArr;
    let language = this.props.language;
    let isGetGenders = false;

    let {
      email,
      password,
      fullName,
      phoneNumber,
      address,
      gender,
      position,
      role,
    } = this.state;

    return (
      <div className="user-redux-container">
        <div className="title">Quản lý người dùng</div>
        <div className="use-redux-body">
          <div className="container">
            <div className="row">
              <div className="col-12 my-3 heading">
                <FormattedMessage id="manage-user.add" />
              </div>
              <div className="col-12">
                {isGetGenders === true ? 'Loading gender' : ''}
              </div>
              <div className="col-3">
                <label>
                  <FormattedMessage id="manage-user.email" />
                </label>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    this.onChangeInput(event, 'email');
                  }}
                  disabled={
                    this.state.action === CRUD_ACTIONS.EDIT ? true : false
                  }
                />
              </div>
              <div className="col-3">
                <label>
                  <FormattedMessage id="manage-user.password" />
                </label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    this.onChangeInput(event, 'password');
                  }}
                  disabled={
                    this.state.action === CRUD_ACTIONS.EDIT ? true : false
                  }
                />
              </div>
              <div className="col-6">
                <label>Họ tên</label>
                <input
                  className="form-control"
                  type="text"
                  value={fullName}
                  onChange={(event) => {
                    this.onChangeInput(event, 'fullName');
                  }}
                />
              </div>
              <div className="col-3">
                <label>
                  <FormattedMessage id="manage-user.phone-number" />
                </label>
                <input
                  className="form-control"
                  type="text"
                  value={phoneNumber}
                  onChange={(event) => {
                    this.onChangeInput(event, 'phoneNumber');
                  }}
                />
              </div>
              <div className="col-9">
                <label>
                  <FormattedMessage id="manage-user.address" />
                </label>
                <input
                  className="form-control"
                  type="text"
                  value={address}
                  onChange={(event) => {
                    this.onChangeInput(event, 'address');
                  }}
                />
              </div>

              <div className="col-3">
                <label>
                  <FormattedMessage id="manage-user.gender" />
                </label>
                <select
                  className="form-control"
                  onChange={(event) => {
                    this.onChangeInput(event, 'gender');
                  }}
                  value={gender}
                >
                  {genders &&
                    genders.length > 0 &&
                    genders.map((item, index) => {
                      return (
                        <option key={index} value={item.keyMap}>
                          {language === LANGUAGES.VI
                            ? item.valueVi
                            : item.valueEn}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Position removed in new backend schema */}

              <div className="col-3">
                <label>
                  <FormattedMessage id="manage-user.role" />
                </label>
                <select
                  className="form-control"
                  onChange={(event) => {
                    this.onChangeInput(event, 'role');
                  }}
                  value={role}
                >
                  {roles &&
                    roles.length > 0 &&
                    roles.map((item, index) => {
                      return (
                        <option key={index} value={item.keyMap}>
                          {language === LANGUAGES.VI
                            ? item.valueVi
                            : item.valueEn}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="col-3">
                <label>
                  <FormattedMessage id="manage-user.image" />
                </label>
                <div className="preview-img-container">
                  <input
                    id="previewImg"
                    type="file"
                    hidden
                    onChange={(event) => this.handleOnChangeImage(event)}
                  />
                  <label className="label-upload" htmlFor="previewImg">
                    Tải ảnh <i className="fas fa-upload"></i>{' '}
                  </label>
                  <div
                    className="preview-image"
                    style={{
                      backgroundImage: `url(${this.state.previewImgURL})`,
                    }}
                    onClick={() => this.openPreviewImage()}
                  ></div>
                </div>
              </div>

              <div className="col-12 my-3">
                <button
                  className={
                    this.state.action === CRUD_ACTIONS.EDIT
                      ? 'btn btn-warning'
                      : 'btn btn-primary'
                  }
                  onClick={() => this.handleSaveUser()}
                >
                  {this.state.action === CRUD_ACTIONS.EDIT ? (
                    <FormattedMessage id="manage-user.edit" />
                  ) : (
                    <FormattedMessage id="manage-user.save" />
                  )}
                </button>
              </div>

              <div className="col-12 mb-5">
                <TableManageUser
                  handleEditUserFromParentKey={this.handleEditUserFromParent}
                  action={this.state.action}
                />
              </div>
            </div>
          </div>
        </div>

        {this.state.isOpen === true && (
          <Lightbox
            mainSrc={this.state.previewImgURL}
            onCloseRequest={() => this.setState({ isOpen: false })}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    listUsers: state.admin.users,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createNewUser: (data) => dispatch(actions.createNewUser(data)),
    fetchUserRedux: () => dispatch(actions.fetchAllUsersStart()),
    editAUserRedux: (data) => dispatch(actions.editAUser(data)),
    // processLogout: () => dispatch(actions.processLogout()),
    // changeLanguageAppRedux: (language) => dispatch(actions.changeLanguageApp(language)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserRedux);
