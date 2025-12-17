import actionTypes from './actionTypes';
import { history } from '../../redux';

export const addUserSuccess = () => ({
  type: actionTypes.ADD_USER_SUCCESS,
});

export const userLoginSuccess = (userInfo) => ({
  type: actionTypes.USER_LOGIN_SUCCESS,
  userInfo: userInfo,
});

export const userLoginFail = () => ({
  type: actionTypes.USER_LOGIN_FAIL,
});

// processLogout as thunk: dispatch logout then navigate to login page
export const processLogout = () => {
  return (dispatch, getState) => {
    localStorage.removeItem('access_token');
    dispatch({ type: actionTypes.PROCESS_LOGOUT });
    // after clearing user state redirect to login
    try {
      history.push('/login');
    } catch (e) {
      // ignore navigation errors
    }
  };
};
