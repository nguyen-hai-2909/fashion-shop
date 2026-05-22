import axios from "./axios";
import * as APIEndpoint from "./ApiEndpoint";

export const SubmitContactService = async (data) => {
  return await axios.post(`${APIEndpoint.CONTACT_ENDPOINT}`, data);
};
