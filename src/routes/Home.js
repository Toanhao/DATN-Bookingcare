import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

class Home extends Component {
    render() {
        const { isLoggedIn, userInfo } = this.props;

        // If not logged in -> public home
        if (!isLoggedIn) return <Redirect to="/home" />;

        // If logged in and role is patient (R3) -> public home
        const roleId = userInfo && userInfo.roleId ? userInfo.roleId : null;
        if (roleId === "R3") return <Redirect to="/home" />;

        // Admin -> system user redux; Doctor -> doctor manage patient
        if (roleId === "R1") return <Redirect to="/system/user-redux" />;
        if (roleId === "R2") return (
            <Redirect to="/doctor/manage-patient" />
        );

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
