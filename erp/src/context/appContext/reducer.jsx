import * as actionTypes from "./types";

export const initialState = {
  isNavMenuClose: false,
  currentApp: "erp",
};

export function contextReducer(state, action) {
  switch (action.type) {
    case actionTypes.OPEN_NAV_MENU:
      return {
        ...state,
        isNavMenuClose: false,
      };
    case actionTypes.CLOSE_NAV_MENU:
      return {
        ...state,
        isNavMenuClose: true,
      };
    case actionTypes.COLLAPSE_NAV_MENU:
      return {
        ...state,
        isNavMenuClose: !state.isNavMenuClose,
      };
    case actionTypes.CHANGE_APP:
      localStorage.setItem("currentApp", action.payload);
      return {
        ...state,
        currentApp: action.payload,
      };
    case actionTypes.DEFAULT_APP:
      localStorage.setItem("currentApp", "erp");
      return {
        ...state,
        currentApp: "erp",
      };

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
