import actionTypes from './actionTypes';
import {
  createNewUserService,
  getAllUsers,
  deleteUserService,
  editUserService,
  getTopDoctorHomeService,
  getAllDoctors,
  getAllDoctorsUser,
  saveDetailDoctorService,
  getAllSpecialty,
  getAllClinic,
} from '../../services/userService';
import { toast } from 'react-toastify';

// Allcode endpoints removed in new backend; gender/role/position are managed locally in components.

export const createNewUser = (data) => {
  return async (dispatch, getState) => {
    try {
      let res = await createNewUserService(data);
      if (res && res.errCode === 0) {
        toast.success('Tạo người dùng thành công');
        dispatch(saveUserSuccess());
        dispatch(fetchAllUsersStart());
      } else {
        dispatch(saveUserFailed());
      }
    } catch (e) {
      dispatch(saveUserFailed());
      console.log('Tạo người dùng thất bại', e);
    }
  };
};

export const saveUserSuccess = () => ({
  type: actionTypes.CREATE_USER_SUCCESS,
});

export const saveUserFailed = () => ({
  type: actionTypes.CREATE_USER__FAILED,
});

export const fetchAllUsersStart = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllUsers('ALL');
      if (res && res.errCode === 0) {
        dispatch(fetchAllUsersSuccess(res.users.reverse()));
      } else {
        toast.error('Lấy danh sách người dùng thất bại');
        dispatch(fetchAllUsersFailed());
      }
    } catch (e) {
      toast.error('Lấy danh sách người dùng thất bại');
      dispatch(fetchAllUsersFailed());
      console.log('fetchAllUsersFailed error', e);
    }
  };
};

export const fetchAllUsersSuccess = (data) => ({
  type: actionTypes.FETCH_ALL_USERS_SUCCESS,
  users: data,
});

export const fetchAllUsersFailed = () => ({
  type: actionTypes.FETCH_ALL_USERS_FAILED,
});

export const deleteAUser = (userId) => {
  return async (dispatch, getState) => {
    try {
      let res = await deleteUserService(userId);
      if (res && res.errCode === 0) {
        toast.success('Xóa người dùng thành công');
        dispatch(deleteUserSuccess());
        dispatch(fetchAllUsersStart());
      } else {
        toast.error('Xóa người dùng thất bại');
        dispatch(deleteUserFailed());
      }
    } catch (e) {
      toast.error('Xóa người dùng thất bại');
      dispatch(deleteUserFailed());
      console.log('deleteUserFailed error', e);
    }
  };
};

export const deleteUserSuccess = () => ({
  type: actionTypes.DELETE_USER_SUCCESS,
});

export const deleteUserFailed = () => ({
  type: actionTypes.DELETE_USER__FAILED,
});

export const editAUser = (data) => {
  return async (dispatch, getState) => {
    try {
      let res = await editUserService(data);
      if (res && res.errCode === 0) {
        toast.success('Cập nhật người dùng thành công');
        dispatch(editUserSuccess());
        dispatch(fetchAllUsersStart());
      } else {
        toast.error('Cập nhật người dùng thất bại');
        dispatch(editUserFailed());
      }
    } catch (e) {
      toast.error('Cập nhật người dùng thất bại');
      dispatch(editUserFailed());
      console.log('Cập nhật người dùng thất bại', e);
    }
  };
};

export const editUserSuccess = () => ({
  type: actionTypes.EDIT_USER_SUCCESS,
});

export const editUserFailed = () => ({
  type: actionTypes.EDIT_USER_FAILED,
});

export const fetchTopDoctor = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getTopDoctorHomeService('');
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.FETCH_TOP_DOCTORS_SUCCESS,
          dataDoctors: res.data,
        });
      } else {
        dispatch({
          type: actionTypes.FETCH_TOP_DOCTORS_FAILED,
        });
      }
    } catch (e) {
      console.log('FETCH_TOP_DOCTORS_FAILED', e);
      dispatch({
        type: actionTypes.FETCH_TOP_DOCTORS_FAILED,
      });
    }
  };
};

export const fetchAllDoctors = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllDoctors();
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_SUCCESS,
          dataDr: res.data,
        });
      } else {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_FAILED,
        });
      }
    } catch (e) {
      console.log('FETCH_ALL_DOCTORS_FAILED', e);
      dispatch({
        type: actionTypes.FETCH_ALL_DOCTORS_FAILED,
      });
    }
  };
};

export const fetchAllDoctorsUser = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllDoctorsUser();
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_SUCCESS,
          dataDr: res.data,
        });
      } else {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_FAILED,
        });
      }
    } catch (e) {
      console.log('FETCH_ALL_DOCTORS_USER_FAILED', e);
      dispatch({
        type: actionTypes.FETCH_ALL_DOCTORS_FAILED,
      });
    }
  };
};

export const saveDetailDoctor = (data) => {
  return async (dispatch, getState) => {
    try {
      let res = await saveDetailDoctorService(data);
      if (res && res.errCode === 0) {
        toast.success('Lưu thông tin bác sĩ thành công!');

        dispatch({
          type: actionTypes.SAVE_DETAIl_DOCTORS_SUCCESS,
        });
      } else {
        toast.error('Lưu thông tin bác sĩ thất bại!');

        dispatch({
          type: actionTypes.SAVE_DETAIL_DOCTORS_FAILED,
        });
      }
    } catch (e) {
      dispatch({
        type: actionTypes.SAVE_DETAIL_DOCTORS_FAILED,
      });
    }
  };
};

// Schedule time now handled via /api/time-slots in components; remove allcode schedule fetch.

export const getRequiredDoctorInfor = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: actionTypes.FETCH_REQUIRED_DOCTOR_Infor_START });
      let resSpecialty = await getAllSpecialty();
      let resClinic = await getAllClinic();
      if (
        resSpecialty &&
        resSpecialty.errCode === 0 &&
        resClinic &&
        resClinic.errCode === 0
      ) {
        // Since allcode is removed, provide minimal placeholders for price/payment/province
        const data = {
          resPrice: [],
          resPayment: [],
          resProvince: [],
          resSpecialty: resSpecialty.data,
          resClinic: resClinic.data,
        };
        dispatch(fetchRequiredDoctorInforSuccess(data));
      } else {
        dispatch(fetchRequiredDoctorInforFailed());
      }
    } catch (e) {
      console.log('getRequiredDoctorInfor', e);
      dispatch(fetchRequiredDoctorInforFailed());
    }
  };
};

export const fetchRequiredDoctorInforSuccess = (allRequiredData) => ({
  type: actionTypes.FETCH_REQUIRED_DOCTOR_Infor_SUCCESS,
  data: allRequiredData,
});

export const fetchRequiredDoctorInforFailed = () => ({
  type: actionTypes.FETCH_REQUIRED_DOCTOR_Infor_FAILED,
});
