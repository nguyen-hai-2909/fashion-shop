import axios from "./axios";
import * as APIEndpoint from "./ApiEndpoint";

export const UpdateAccountService = async (data, token) => {
  return await axios.put(`${APIEndpoint.USER_ENDPOINT}/edit`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const ChangePasswordAccountService = async (password, token) => {
  return await axios.put(
    `${APIEndpoint.USER_ENDPOINT}/change-password`,
    password,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const ForgotPasswordAccountService = async (data) => {
  return await axios.post(`${APIEndpoint.USER_ENDPOINT}/send-mail`, data);
};

export const ResetPasswordService = async (data, token) => {
  return await axios.put(
    `${APIEndpoint.USER_ENDPOINT}/reset-password`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
