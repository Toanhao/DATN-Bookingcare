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
import QuickBookingModal from '../../Patient/Doctor/Modal/QuickBookingModal';
import BookingHistoryModal from '../../Patient/BookingHistory/BookingHistoryModal';

class HomeHeader extends Component {
  changeLanguage = (language) => {
    this.props.changeLanguageAppRedux(language);
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      showUserMenu: false,
      isOpenQuickBookingModal: false,
      isOpenBookingHistoryModal: false,
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

  toggleQuickBookingModal = () => {
    this.setState({
      isOpenQuickBookingModal: !this.state.isOpenQuickBookingModal,
    });
  };

  toggleBookingHistoryModal = () => {
    this.setState({
      isOpenBookingHistoryModal: !this.state.isOpenBookingHistoryModal,
      showUserMenu: false,
    });
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
        : 'Find specialty, doctor, clinic';
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

              <Link
                to="/all-directory?tab=handbook"
                className="child-content"
                style={{
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <b>
                    <FormattedMessage id="home-header.fee" />
                  </b>
                </div>
                <div className="subs-title">
                  <FormattedMessage id="home-header.check-health" />
                </div>
              </Link>
            </div>
            <div className="right-content">
              <button
                className="quick-booking-header-btn"
                onClick={this.toggleQuickBookingModal}
                title="Đặt lịch khám nhanh"
              >
                <i className="fas fa-calendar-plus"></i>
                <span>Đặt lịch nhanh</span>
              </button>

              {/* User Menu */}
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
                      {this.props.userInfo?.fullName
                        }
                    </span>
                  </div>

                  {this.state.showUserMenu && (
                    <div className="user-dropdown">
                      {/* Language Settings */}
                      <div className="user-dropdown-item language-item">
                        <span className="label">
                          <i className="fas fa-globe"></i> Ngôn ngữ:
                        </span>
                        <div className="language-buttons">
                          <button
                            className={`lang-btn ${
                              this.props.language === LANGUAGES.VI
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => {
                              this.changeLanguage(LANGUAGES.VI);
                            }}
                          >
                            VN
                          </button>
                          <button
                            className={`lang-btn ${
                              this.props.language === LANGUAGES.EN
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => {
                              this.changeLanguage(LANGUAGES.EN);
                            }}
                          >
                            EN
                          </button>
                        </div>
                      </div>

                      <div className="dropdown-divider"></div>

                      {/* Booking History */}
                      <div
                        className="user-dropdown-item"
                        onClick={this.toggleBookingHistoryModal}
                      >
                        <i className="fas fa-history"></i>
                        <span>Lịch sử khám</span>
                      </div>

                      <div className="dropdown-divider"></div>

                      {/* Support */}
                      <div
                        className="user-dropdown-item"
                        onClick={() => {
                          this.handleSupportClick();
                          this.setState({ showUserMenu: false });
                        }}
                      >
                        <i className="fas fa-question-circle"></i>
                        <span>
                          <FormattedMessage id="home-header.support" />
                        </span>
                      </div>

                      <div className="dropdown-divider"></div>

                      {/* Logout */}
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

        {/* Quick Booking Modal */}
        <QuickBookingModal
          isOpenModal={this.state.isOpenQuickBookingModal}
          closeModal={this.toggleQuickBookingModal}
        />

        {/* Booking History Modal */}
        <BookingHistoryModal
          isOpen={this.state.isOpenBookingHistoryModal}
          closeModal={this.toggleBookingHistoryModal}
        />
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
