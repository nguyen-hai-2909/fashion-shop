/* eslint-disable react/prop-types */
import { createContext, useEffect, useReducer } from "react";

const initialState = {
  admin:
    localStorage.getItem("admin") !== undefined
      ? JSON.parse(localStorage.getItem("admin"))
      : null,
  tokenAdmin:
    localStorage.getItem("token-admin") !== undefined
      ? JSON.parse(localStorage.getItem("token-admin"))
      : null,
};

export const adminContext = createContext(initialState);

const adminReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        admin: null,
        tokenAdmin: null,
      };
    case "LOGIN_SUCCESS":
      localStorage.setItem("admin", JSON.stringify(action.payload.admin));
      localStorage.setItem(
        "token-admin",
        JSON.stringify(action.payload.tokenAdmin)
      );
      return {
        admin: action.payload.admin,
        tokenAdmin: action.payload.tokenAdmin,
      };
    case "LOG_OUT":
      return {
        admin: null,
        tokenAdmin: null,
      };
    default:
      return state;
  }
};

export const AdminContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  useEffect(() => {
    localStorage.setItem("admin", JSON.stringify(state.admin));
    localStorage.setItem("token-admin", JSON.stringify(state.tokenAdmin));
  }, [state]);

  return (
    <adminContext.Provider
      value={{ admin: state.admin, tokenAdmin: state.tokenAdmin, dispatch }}
    >
      {children}
    </adminContext.Provider>
  );
};
