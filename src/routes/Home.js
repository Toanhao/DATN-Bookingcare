import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

class Home extends Component {
  render() {
    const { isLoggedIn, userInfo } = this.props;

    // If not logged in -> public home
    if (!isLoggedIn) return <Redirect to="/home" />;

    // Nếu là patient → public home
    const role = userInfo && userInfo.role ? userInfo.role : null;
    if (role === 'PATIENT') return <Redirect to="/home" />;

    // Admin → system user redux; Doctor → doctor manage schedule
    if (role === 'ADMIN') return <Redirect to="/system/user-redux" />;
    if (role === 'DOCTOR') return <Redirect to="/doctor/manage-schedule" />;

    // Fallback
    return <Redirect to="/home" />;
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
