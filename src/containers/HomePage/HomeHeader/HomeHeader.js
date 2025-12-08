/** @format */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import './HomeHeader.scss';
import logo from '../../../assets/logo.svg';
import computeImageUrl from '../../../utils/imageUtils';
import userAvatar from '../../../assets/images/user.svg';
import { FormattedMessage } from 'react-intl';
import { LANGUAGES } from '../../../utils';
import { changeLanguageApp, processLogout } from '../../../store/actions';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Sidebar } from 'primereact/sidebar';

class HomeHeader extends Component {
  changeLanguage = (language) => {
    this.props.changeLanguageAppRedux(language);
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      showUserMenu: false,
    };

    this.userMenuRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  handleDocumentClick = (e) => {
    if (
      this.userMenuRef &&
      this.userMenuRef.current &&
      !this.userMenuRef.current.contains(e.target)
    ) {
      this.setState({ showUserMenu: false });
    }
  };

  toggleUserMenu = (e) => {
    // prevent document click handler from immediately closing it
    e && e.stopPropagation && e.stopPropagation();
    this.setState((prev) => ({ showUserMenu: !prev.showUserMenu }));
  };

  handleLogoutFromMenu = () => {
    this.setState({ showUserMenu: false });
    this.props.processLogout();
  };

  goToAllDirectory = (tab) => {
    if (this.props.history) {
      const t = tab ? `?tab=${tab}` : '';
      this.props.history.push(`/all-directory${t}`);
    }
  };

  returnToHome = () => {
    if (this.props.history) {
      this.props.history.push('/home');
    }
  };

  handleSupportClick = () => {
    const message = `Nền tảng Đặt khám BookingCare
ĐT:0347581948
Email: support@bookingcare.vn
Trực thuộc: Công ty CP Công nghệ BookingCare
Địa chỉ: PTIT Hà Nội`;
    window.alert(message);
  };

  render() {
    let language = this.props.language;
    let placeHolder =
      language === LANGUAGES.VI
        ? 'Tìm tất cả chuyên khoa, bác sĩ, cơ sở y tế '
        : 'Tìm tất cả chuyên khoa, bác sĩ, cơ sở y tế';
    return (
      <React.Fragment>
        <div className="home-header-container">
          <div className="home-header-content">
            <div className="left-content">
              <Sidebar
                visible={this.state.visible}
                onHide={() => this.setState({ visible: false })}
                style={{ width: '260px' }}
              >
                <div className="sidebar-menu">
                  <ul>
                    <li>
                      <Link
                        to="/home"
                        onClick={() => this.setState({ visible: false })}
                        className="sidebar-link"
                      >
                        <i className="fa fa-home" />
                        <span style={{ marginLeft: 8 }}>Trang chủ</span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/all-directory?tab=specialty"
                        onClick={() => this.setState({ visible: false })}
                        className="sidebar-link"
                      >
                        <i className="fa fa-list-alt" />
                        <span style={{ marginLeft: 8 }}>Chuyên khoa</span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/all-directory?tab=doctor"
                        onClick={() => this.setState({ visible: false })}
                        className="sidebar-link"
                      >
                        <i className="fa fa-user-md" />
                        <span style={{ marginLeft: 8 }}>Bác sĩ nổi bật</span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/all-directory?tab=clinic"
                        onClick={() => this.setState({ visible: false })}
                        className="sidebar-link"
                      >
                        <i className="fa fa-hospital" />
                        <span style={{ marginLeft: 8 }}>
                          Cơ sở y tế nổi bật
                        </span>
                      </Link>
                    </li>

                    <li>
                      <i className="fa fa-question-circle" />
                      <span
                        onClick={() => {
                          this.handleSupportClick();
                          this.setState({ visible: false });
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <FormattedMessage id="home-header.support" />
                      </span>
                    </li>
                  </ul>
                </div>
              </Sidebar>
              <i
                className="fa fa-bars"
                onClick={() => this.setState({ visible: true })}
              ></i>
              <Link to="/home">
                <img
                  className="header-logo"
                  src={logo}
                  alt="BookingCare logo"
                />
              </Link>
            </div>
            <div className="center-content">
              <Link
                to="/all-directory?tab=specialty"
                className="child-content"
                style={{
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <b>
                    <FormattedMessage id="home-header.speciality" />
                  </b>
                </div>
                <div className="subs-title">
                  <FormattedMessage id="home-header.searchdoctor" />
                </div>
              </Link>

              <Link
                to="/all-directory?tab=clinic"
                className="child-content"
                style={{
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <b>
                    <FormattedMessage id="home-header.health-facility" />
                  </b>
                </div>
                <div className="subs-title">
                  <FormattedMessage id="home-header.select-room" />
                </div>
              </Link>
              <Link
                to="/all-directory?tab=doctor"
                className="child-content"
                style={{
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <b>
                    <FormattedMessage id="home-header.doctor" />
                  </b>
                </div>
                <div className="subs-title">
                  <FormattedMessage id="home-header.select-doctor" />
                </div>
              </Link>
              <div className="child-content">
                <div>
                  <b>
                    <FormattedMessage id="home-header.fee" />
                  </b>
                </div>
                <div className="subs-title">
                  <FormattedMessage id="home-header.check-health" />
                </div>
              </div>
            </div>
            <div className="right-content">
              <div
                className="support"
                onClick={() => this.handleSupportClick()}
                style={{ cursor: 'pointer' }}
              >
                <i className="fas fa-question-circle"></i>
                <FormattedMessage id="home-header.support" />
              </div>
              <div
                className={
                  language === LANGUAGES.VI
                    ? 'language-vi active'
                    : 'language-vi'
                }
              >
                <span onClick={() => this.changeLanguage(LANGUAGES.VI)}>
                  VN
                </span>
              </div>
              <div
                className={
                  language === LANGUAGES.EN
                    ? 'language-en active'
                    : 'language-en'
                }
              >
                <span onClick={() => this.changeLanguage(LANGUAGES.EN)}>
                  EN
                </span>
              </div>
              {this.props.isLoggedIn ? (
                <div
                  className="user-section"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: 12,
                    position: 'relative',
                  }}
                  ref={this.userMenuRef}
                >
                  <div
                    className="user-Info"
                    title={this.props.userInfo && this.props.userInfo.email}
                    onClick={this.toggleUserMenu}
                    role="button"
                  >
                    {(() => {
                      const avatarUrl =
                        (this.props.userInfo && this.props.userInfo.image
                          ? computeImageUrl(this.props.userInfo.image)
                          : null) || userAvatar;
                      return (
                        <div
                          className="user-avatar"
                          style={{ backgroundImage: `url(${avatarUrl})` }}
                          role="img"
                          aria-label="user avatar"
                        />
                      );
                    })()}
                    <span className="user-name">
                      {this.props.userInfo &&
                      this.props.userInfo.firstName &&
                      this.props.userInfo.lastName
                        ? `${this.props.userInfo.lastName} ${this.props.userInfo.firstName} `
                        : ''}
                    </span>
                  </div>

                  {this.state.showUserMenu && (
                    <div className="user-dropdown">
                      {/* you can add more items here (Profile, Settings...) */}
                      <div
                        className="user-dropdown-item"
                        onClick={this.handleLogoutFromMenu}
                        role="button"
                      >
                        <i
                          className="fas fa-sign-out-alt"
                          style={{ marginRight: 8 }}
                        ></i>
                        <FormattedMessage
                          id="home-header.logout"
                          defaultMessage="Logout"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="login-button">
                  <i className="fas fa-sign-in-alt"></i>
                  <FormattedMessage
                    id="home-header.login"
                    defaultMessage="Login"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
        {this.props.isShowBanner && (
          <div className="home-header-banner">
            <div className="content-up">
              <div className="title1">
                <FormattedMessage id="banner.title1" />
              </div>
              <div className="title2">
                <FormattedMessage id="banner.title2" />
              </div>
              <div
                className="search"
                onClick={() => this.goToAllDirectory('all')}
              >
                <i className="fas fa-search"></i>
                <input type="text" placeholder={placeHolder}></input>
              </div>
            </div>
            <div className="content-down">
              <div className="options">
                <div className="option-child">
                  <div className="icon-child">
                    <i className="far fa-hospital"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child1" />
                  </div>
                </div>
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child2" />
                  </div>
                </div>
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-procedures"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child3" />
                  </div>
                </div>
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-flask"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child4" />
                  </div>
                </div>
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child5" />
                  </div>
                </div>
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-briefcase-medical"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language)),
    processLogout: () => dispatch(processLogout()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HomeHeader)
);
