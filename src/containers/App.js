import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter as Router } from "connected-react-router";
import { history } from "../redux";
import { ToastContainer } from "react-toastify";
import HomePage from "./HomePage/HomePage.js";
import DetailDoctor from "./Patient/Doctor/DetailDoctor.js";
import Doctor from "../routes/Doctor";
import DetailSpecialty from "./Patient/Specialty/DetailSpecialty";
import DetailClinic from "./Patient/Clinic/DetailClinic";
import AllDirectory from "./HomePage/AllSpecialties/AllDirectory";
import VerifyEmail from "./Patient/VerifyEmail.js";
import {
    userIsNotAuthenticated,
    userIsAdminOrDoctor,
} from "../hoc/authentication";
import CustomScrollbars from "../components/CustomScrollbars";
import { path } from "../utils";
import Home from "../routes/Home";
import Login from "../containers/Auth/Login";
import Register from "../containers/Auth/Register";
import System from "../routes/System";
import ConfirmModal from "../components/ConfirmModal";
import ChatWidget from "../components/ChatWidget/ChatWidget";
import DiagnosisWidget from "../components/DiagnosisWidget/DiagnosisWidget.js";
import BookingChat from "../components/BookingChat/BookingChat.js";
class App extends Component {
    handlePersistorState = () => {
        const { persistor } = this.props;
        let { bootstrapped } = persistor.getState();
        if (bootstrapped) {
            if (this.props.onBeforeLift) {
                Promise.resolve(this.props.onBeforeLift())
                    .then(() => this.setState({ bootstrapped: true }))
                    .catch(() => this.setState({ bootstrapped: true }));
            } else {
                this.setState({ bootstrapped: true });
            }
        }
    };

    componentDidMount() {
        this.handlePersistorState();
    }

    render() {
        return (
            <Fragment>
                <Router history={history}>
                    <div className="main-container">
                        <ConfirmModal />
                        <span className="content-container">
                            <CustomScrollbars
                                style={{ height: "100vh", width: "100%" }}
                            >
                                <Switch>
                                    <Route
                                        path={path.HOME}
                                        exact
                                        component={Home}
                                    />
                                    <Route
                                        path={path.LOGIN}
                                        component={userIsNotAuthenticated(
                                            Login
                                        )}
                                    />
                                    <Route
                                        path={path.REGISTER}
                                        component={userIsNotAuthenticated(
                                            Register
                                        )}
                                    />
                                    <Route
                                        path={path.SYSTEM}
                                        component={userIsAdminOrDoctor(System)}
                                    />
                                    <Route
                                        path={"/doctor"}
                                        component={userIsAdminOrDoctor(Doctor)}
                                    />
                                    <Route
                                        path={path.HOMEPAGE}
                                        component={HomePage}
                                    />
                                    <Route
                                        path={path.ALL_DIRECTORY}
                                        component={AllDirectory}
                                    />
                                    <Route
                                        path={path.DETAIL_SPECIALTY}
                                        component={DetailSpecialty}
                                    />
                                    <Route
                                        path={path.DETAIL_DOCTOR}
                                        component={DetailDoctor}
                                    />
                                    <Route
                                        path={path.DETAIL_CLINIC}
                                        component={DetailClinic}
                                    />
                                    <Route
                                        path={path.VERIFY_EMAIL_BOOKING}
                                        component={VerifyEmail}
                                    />
                                </Switch>
                            </CustomScrollbars>
                        </span>

                        <ToastContainer
                            position="bottom-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="light"
                        />
                        <BookingChat />
                        <ChatWidget />
                        <DiagnosisWidget />
                    </div>
                </Router>
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        started: state.app.started,
        isLoggedIn: state.user.isLoggedIn,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
