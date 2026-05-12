/* eslint-disable react/prop-types */
import { createContext, useReducer } from "react";

const initialState = {
  discountCode: null,
  value: 0,
};

export const discountContext = createContext(initialState);

const discountReducer = (state, action) => {
  switch (action.type) {
    case "ADD_DISCOUNT":
      return {
        discountCode: action.payload.discountCode,
        value: action.payload.value,
      };
    case "CLEAR_DISCOUNT":
      return {
        discountCode: null,
        value: 0,
      };
    default:
      break;
  }
};

export const DiscountContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(discountReducer, initialState);
  return (
    <discountContext.Provider
      value={{ discountCode: state.discountCode, value: state.value, dispatch }}
    >
      {children}
    </discountContext.Provider>
  );
};
