import axios from "./axios";
import * as APIEndpoint from "./ApiEndpoint";

export const SignupAccountService = async (data) => {
  return await axios.post(APIEndpoint.USER_ENDPOINT, data);
};

export const LoginAccountService = async (data) => {
  return await axios.post(`${APIEndpoint.USER_ENDPOINT}/login`, data);
};
