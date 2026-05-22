import axios from "./axios";
import * as ApiEndpoint from "./ApiEndpoint";
export const CheckoutOrderService = async (data, token) => {
  return await axios.post(`${ApiEndpoint.ORDER_ENDPOINT}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const GetAllOrderUserService = async (query, token) => {
  return await axios.get(`${ApiEndpoint.ORDER_ENDPOINT}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: query,
  });
};

export const GetOrderUserDetailService = async (id, token) => {
  return await axios.get(`${ApiEndpoint.ORDER_ENDPOINT}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
