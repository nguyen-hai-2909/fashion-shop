import axios from "./axios";
import * as APIEndpoint from "./ApiEndpoint";

export const GetDataDashboardService = async (token) => {
  return axios.get(`${APIEndpoint.DASHBOARD_ENDPOINT}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
