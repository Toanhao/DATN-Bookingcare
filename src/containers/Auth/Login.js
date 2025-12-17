import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

import * as actions from '../../store/actions';
import { handleLoginApi } from '../../services/userService';
import './Login.scss';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      isShowPassword: false,
      errMessage: '',
    };
  }

  handleOnChangeEmail = (event) => {
    this.setState({
      email: event.target.value,
    });
  };

  handleOnChangePassword = (event) => {
    this.setState({
      password: event.target.value,
    });
  };

  handleLogin = async () => {
    this.setState({
      errMessage: '',
    });
    try {
      const res = await handleLoginApi(this.state.email, this.state.password);
      if (!res || res.errCode !== 0) {
        this.setState({
          errMessage: res?.message || 'Login failed',
        });
        return;
      }

      // Trích xuất user và token từ response
      const userData = res.data || {};
      const { user, token } = userData;
      
      // Lưu token vào localStorage nếu có
      if (token) {
        localStorage.setItem('access_token', token);
      }
      
      // Nếu user có id thì đăng nhập thành công, lưu vào Redux
      if (user && user.id) {
        this.props.userLoginSuccess(user);
        
        // Điều hướng tới trang khác nhau tùy theo role
        const role = user.role;
        if (role === 'ADMIN') {
          this.props.navigate('/system/user-redux');
        } else if (role === 'DOCTOR') {
          this.props.navigate('/doctor/manage-schedule');
        } else if (role === 'PATIENT') {
          this.props.navigate('/home');
        } else {
          this.props.navigate('/home');
        }
      } else {
        this.setState({
          errMessage: 'Invalid user data',
        });
      }
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.message ||
        'Login failed';
      this.setState({
        errMessage: message,
      });
    }
  };

  handleShowHidePassword = () => {
    this.setState({
      isShowPassword: !this.state.isShowPassword,
    });
  };

  handleKeyDown = (event) => {
    console.log('keydown', event);
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.handleLogin();
    }
  };

  render() {
    //JSX
    return (
      <div className="login-background">
        <div className="login-container">
          <div className="login-content">
            <div className="login-content row">
              <div className="col-12 text-login">Login</div>
              <div className="col-12 form-group login-input">
                <label>Email</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your Email"
                  value={this.state.email}
                  onChange={(event) => this.handleOnChangeEmail(event)}
                />
              </div>

              <div className="col-12 form-group login-input">
                <label>Password</label>
                <div className="custom-input-password">
                  <input
                    type={this.state.isShowPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter your Password"
                    value={this.state.password}
                    onChange={(event) => {
                      this.handleOnChangePassword(event);
                    }}
                    onKeyDown={(event) => this.handleKeyDown(event)}
                  />
                  <span
                    onClick={() => {
                      this.handleShowHidePassword();
                    }}
                  >
                    <i
                      className={
                        this.state.isShowPassword
                          ? 'far fa-eye'
                          : 'far fa-eye-slash'
                      }
                    >
                      {' '}
                    </i>
                  </span>
                </div>
              </div>
              <div className="col-12" style={{ color: 'red' }}>
                {this.state.errMessage}
              </div>
              <div className="col-12 form-group">
                <button
                  className="btn-login"
                  onClick={() => {
                    this.handleLogin();
                  }}
                >
                  Log in
                </button>
              </div>
              <div className="col-12">
                <span className="forgot-password">Forgot your password ?</span>
              </div>
              <div className="col-12 text-center register-signup">
                <span className="text-signup">
                  Chưa có tài khoản?{' '}
                  <a
                    href="/register"
                    onClick={(e) => {
                      e.preventDefault();
                      this.props.navigate('/register');
                    }}
                  >
                    Đăng ký ngay
                  </a>
                </span>
              </div>
              <div className="col-12 text-center my-3">
                <span className="text-other-login">Or login with:</span>
              </div>
              <div className="col-12 social-login">
                <i className="fab fa-google-plus-g google"></i>
                <i className="fab fa-facebook-f facebook"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
    // userLoginFail: () => dispatch(actions.adminLoginFail()),
    userLoginSuccess: (userInfo) =>
      dispatch(actions.userLoginSuccess(userInfo)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
