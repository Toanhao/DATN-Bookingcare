import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import * as actions from '../../store/actions';
import { createNewUserService } from '../../services/userService';
import { CommonUtils } from '../../utils';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import './Register.scss';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      gender: '',
      genderArr: [],
      previewImgURL: '',
      avatar: '',
      isLoading: false,
    };
  }

  async componentDidMount() {
    this.props.getGenderStart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.genderRedux !== this.props.genderRedux) {
      let arrGenders = this.props.genderRedux;
      this.setState({
        genderArr: arrGenders,
        gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : '',
      });
    }
  }

  handleOnChangeInput = (event, id) => {
    let copyState = { ...this.state };
    copyState[id] = event.target.value;
    this.setState({
      ...copyState,
    });
  };

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

  checkValidateInput = () => {
    let isValid = true;
    let arrCheck = [
      'email',
      'password',
      'confirmPassword',
      'firstName',
      'lastName',
      'phoneNumber',
      'address',
    ];

    for (let i = 0; i < arrCheck.length; i++) {
      if (!this.state[arrCheck[i]]) {
        isValid = false;
        toast.error(`Vui lòng nhập đầy đủ: ${arrCheck[i]}`);
        return isValid;
      }
    }

    // Check email format
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.state.email)) {
      toast.error('Email không hợp lệ');
      return false;
    }

    // Check password length
    if (this.state.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    // Check confirm password
    if (this.state.password !== this.state.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return false;
    }

    // Check phone number
    let phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(this.state.phoneNumber)) {
      toast.error('Số điện thoại không hợp lệ');
      return false;
    }

    return isValid;
  };

  handleRegister = async () => {
    this.setState({ isLoading: true });

    let isValid = this.checkValidateInput();
    if (!isValid) {
      this.setState({ isLoading: false });
      return;
    }

    try {
      let res = await createNewUserService({
        email: this.state.email,
        password: this.state.password,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        address: this.state.address,
        phonenumber: this.state.phoneNumber,
        gender: this.state.gender,
        roleId: 'R3',
        positionId: 'POS1',
        avatar: this.state.avatar,
      });

      this.setState({ isLoading: false });

      if (res && res.errCode === 0) {
        toast.success('Đăng ký tài khoản thành công! Chuyển hướng đến trang đăng nhập...');
        setTimeout(() => this.props.navigate('/login'), 2000);
      } else {
        toast.error(res.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      this.setState({ isLoading: false });
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(errorMsg);
    }
  };

  handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.handleRegister();
    }
  };

  render() {
    const { email, password, confirmPassword, firstName, lastName, phoneNumber, address, gender, genderArr, isLoading } = this.state;

    return (
      <LoadingOverlay active={isLoading} spinner text="Đang xử lý...">
        <div className="register-background">
          <div className="register-container">
            <div className="register-content row">
              <div className="col-12 text-register">Đăng Ký Tài Khoản</div>

              <div className="col-md-6 col-sm-12 form-group register-input">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, 'email')
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6 col-sm-12 form-group register-input">
                  <label>Số Điện Thoại</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập số điện thoại"
                    value={phoneNumber}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, 'phoneNumber')
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6 col-sm-12 form-group register-input">
                  <label>Họ</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập họ của bạn"
                    value={lastName}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, 'lastName')
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6 col-sm-12 form-group register-input">
                  <label>Tên</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tên của bạn"
                    value={firstName}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, 'firstName')
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6 col-sm-12 form-group register-input">
                  <label>Mật Khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    value={password}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, 'password')
                    }
                    disabled={isLoading}
                    onKeyDown={(event) => this.handleKeyDown(event)}
                  />
                </div>

                <div className="col-md-6 col-sm-12 form-group register-input">
                  <label>Xác Nhận Mật Khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, 'confirmPassword')
                    }
                    disabled={isLoading}
                    onKeyDown={(event) => this.handleKeyDown(event)}
                  />
                </div>

                <div className="col-md-6 col-sm-12 form-group register-input">
                  <label>Giới Tính</label>
                  <select
                    className="form-control"
                    value={gender}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, 'gender')
                    }
                    disabled={isLoading}
                  >
                    {genderArr &&
                      genderArr.length > 0 &&
                      genderArr.map((item, index) => {
                        return (
                          <option key={index} value={item.keyMap}>
                            {item.valueVi}
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div className="col-md-6 col-sm-12 form-group register-input">
                  <label>Ảnh Đại Diện</label>
                  <div className="preview-img-container">
                    <input
                      id="previewImg"
                      type="file"
                      hidden
                      onChange={(event) => this.handleOnChangeImage(event)}
                      disabled={isLoading}
                    />
                    <label className="label-upload" htmlFor="previewImg">
                      Tải ảnh <i className="fas fa-upload"></i>
                    </label>
                    <div
                      className="preview-image"
                      style={{ backgroundImage: `url(${this.state.previewImgURL})` }}
                    ></div>
                  </div>
                </div>

                <div className="col-12 form-group register-input">
                  <label>Địa Chỉ</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập địa chỉ của bạn"
                    value={address}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, 'address')
                    }
                    disabled={isLoading}
                    onKeyDown={(event) => this.handleKeyDown(event)}
                  />
                </div>

                <div className="col-12 form-group">
                  <button
                    className="btn-register"
                    onClick={() => this.handleRegister()}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
                  </button>
                </div>

                <div className="col-12 text-center my-3">
                  <span className="login-link">
                    Đã có tài khoản?{' '}
                    <a
                      href="/login"
                      onClick={(e) => {
                        e.preventDefault();
                        this.props.navigate('/login');
                      }}
                    >
                      Đăng Nhập
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
      </LoadingOverlay>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    genderRedux: state.admin.genders,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
    getGenderStart: () => dispatch(actions.fetchGenderStart()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Register);
