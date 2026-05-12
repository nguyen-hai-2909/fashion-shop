import axios from "./axios";
import * as ApiEndpoint from "./ApiEndpoint";

export const LoginAdminService = async (data) => {
  return await axios.post(`${ApiEndpoint.ADMIN_ENDPOINT}/login`, data);
};

export const GetProductAdminService = async (query, token) => {
  return await axios.get(`${ApiEndpoint.ADMIN_ENDPOINT}/product`, {
    headers: { Authorization: `Bearer ${token}` },
    params: query,
  });
};

export const GetAdminProductDetailService = async (id, token) => {
  return await axios.get(`${ApiEndpoint.ADMIN_ENDPOINT}/product/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const GetUserAdminService = async (query, token) => {
  return await axios.get(`${ApiEndpoint.ADMIN_ENDPOINT}/user`, {
    headers: { Authorization: `Bearer ${token}` },
    params: query,
  });
};

export const GetOrderAdminService = async (query, token) => {
  return await axios.get(`${ApiEndpoint.ADMIN_ENDPOINT}/order`, {
    headers: { Authorization: `Bearer ${token}` },
    params: query,
  });
};

export const GetOrderAdminDetailService = async (id, token) => {
  return await axios.get(`${ApiEndpoint.ADMIN_ENDPOINT}/order/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const UpdateStatusAdminService = async (id, data, token) => {
  return await axios.patch(`${ApiEndpoint.ADMIN_ENDPOINT}/order/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const GetReviewsAdminService = async (query, token) => {
  return await axios.get(`${ApiEndpoint.ADMIN_ENDPOINT}/reviews`, {
    headers: { Authorization: `Bearer ${token}` },
    params: query,
  });
};

export const DeleteReviewAdminService = async (orderId, itemIndex, token) => {
  return await axios.delete(
    `${ApiEndpoint.ADMIN_ENDPOINT}/reviews/${orderId}/${itemIndex}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
