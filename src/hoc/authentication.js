import locationHelperBuilder from "redux-auth-wrapper/history4/locationHelper";
import { connectedRouterRedirect } from "redux-auth-wrapper/history4/redirect";

const locationHelper = locationHelperBuilder({});

export const userIsAuthenticated = connectedRouterRedirect({
    authenticatedSelector: (state) => state.user.isLoggedIn,
    wrapperDisplayName: "UserIsAuthenticated",
    redirectPath: "/login",
});

export const userIsNotAuthenticated = connectedRouterRedirect({
    // Want to redirect the user when they are authenticated
    authenticatedSelector: (state) => !state.user.isLoggedIn,
    wrapperDisplayName: "UserIsNotAuthenticated",
    redirectPath: (state, ownProps) =>
        locationHelper.getRedirectQueryParam(ownProps) || "/",
    allowRedirectBack: false,
});

// Only allow access to admin/doctor system pages. If the user is a patient
// (roleId === 'R3') redirect them to the public home page.
export const userIsAdminOrDoctor = connectedRouterRedirect({
    authenticatedSelector: (state) => {
        const isLoggedIn = state.user && state.user.isLoggedIn;
        const roleId = state.user && state.user.userInfo && state.user.userInfo.roleId;
        return isLoggedIn && roleId && roleId !== "R3";
    },
    wrapperDisplayName: "UserIsAdminOrDoctor",
    // If user is not logged in send them to login (so login can redirect back).
    // If user is logged in but is a patient (roleId === 'R3') send them to public home.
    redirectPath: (state) => {
        if (!state.user || !state.user.isLoggedIn) return "/login";
        return "/home";
    },
});
