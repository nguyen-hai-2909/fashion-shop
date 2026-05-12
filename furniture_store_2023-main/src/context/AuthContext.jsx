/* eslint-disable react/prop-types */
import { createContext, useEffect, useReducer } from "react";

const initialState = {
  user:
    localStorage.getItem("user") !== undefined
      ? JSON.parse(localStorage.getItem("user"))
      : null,
  token:
    localStorage.getItem("token") !== undefined
      ? JSON.parse(localStorage.getItem("token"))
      : null,
};

export const authContext = createContext(initialState);

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        token: null,
      };

    case "LOGIN_SUCCESS":
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", JSON.stringify(action.payload.token));
      return {
        user: action.payload.user,
        token: action.payload.token,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload.user,
      };
    case "LOG_OUT":
      return {
        user: null,
        token: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
    localStorage.setItem("token", JSON.stringify(state.token));
  }, [state]);
  return (
    <authContext.Provider
      value={{
        user: state.user,
        token: state.token,
        dispatch,
      }}
    >
      {children}
    </authContext.Provider>
  );
};
