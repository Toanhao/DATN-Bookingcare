import actionTypes from '../actions/actionTypes';

const initialState = {
  users: [],
  topDoctors: [],
  allDoctors: [],
  allRequiredDoctorInfor: [],
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    // allcode-driven gender/position/role removed
    case actionTypes.FETCH_ALL_USERS_SUCCESS:
      state.users = action.users;
      return {
        ...state,
      };

    case actionTypes.FETCH_ALL_USERS_FAILED:
      state.users = [];
      return {
        ...state,
      };

    case actionTypes.FETCH_TOP_DOCTORS_SUCCESS:
      state.topDoctors = action.dataDoctors;
      return {
        ...state,
      };

    case actionTypes.FETCH_TOP_DOCTORS_FAILED:
      state.topDoctors = [];
      return {
        ...state,
      };
    case actionTypes.FETCH_ALL_DOCTORS_SUCCESS:
      state.allDoctors = action.dataDr;
      return {
        ...state,
      };

    case actionTypes.FETCH_ALL_DOCTORS_FAILED:
      state.allDoctors = [];
      return {
        ...state,
      };

    // schedule time allcode removed; handled in components

    case actionTypes.FETCH_REQUIRED_DOCTOR_Infor_SUCCESS:
      state.allRequiredDoctorInfor = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_REQUIRED_DOCTOR_Infor_FAILED:
      state.allRequiredDoctorInfor = [];
      return {
        ...state,
      };

    default:
      return state;
  }
};

export default adminReducer;
