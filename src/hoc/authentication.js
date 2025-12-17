import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';

const locationHelper = locationHelperBuilder({});

export const userIsAuthenticated = connectedRouterRedirect({
  authenticatedSelector: (state) => state.user.isLoggedIn,
  wrapperDisplayName: 'UserIsAuthenticated',
  redirectPath: '/login',
});

export const userIsNotAuthenticated = connectedRouterRedirect({
  // Want to redirect the user when they are authenticated
  authenticatedSelector: (state) => !state.user.isLoggedIn,
  wrapperDisplayName: 'UserIsNotAuthenticated',
  redirectPath: (state, ownProps) =>
    locationHelper.getRedirectQueryParam(ownProps) || '/',
  allowRedirectBack: false,
});

// Chỉ cho phép admin/doctor vào system pages. Patient redirect về home.
export const userIsAdminOrDoctor = connectedRouterRedirect({
  authenticatedSelector: (state) => {
    const isLoggedIn = state.user && state.user.isLoggedIn;
    const role =
      state.user && state.user.userInfo && state.user.userInfo.role;
    return isLoggedIn && role && role !== 'PATIENT';
  },
  wrapperDisplayName: 'UserIsAdminOrDoctor',
  // Nếu chưa login → /login; nếu là patient → /home
  redirectPath: (state) => {
    if (!state.user || !state.user.isLoggedIn) return '/login';
    return '/home';
  },
});
