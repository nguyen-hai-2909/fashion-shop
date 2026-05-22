import axios from "./axios";
import * as APIEndpoint from "./ApiEndpoint";

export const SendMailDiscountService = async (email) => {
  return await axios.post(`${APIEndpoint.DISCOUNT_ENDPOINT}/email`, {
    email: email,
  });
};

export const CheckDiscountService = async (discount) => {
  return await axios.post(`${APIEndpoint.DISCOUNT_ENDPOINT}/code`, discount);
};

export const GetAllDiscountService = async (token, query) => {
  return await axios.get(`${APIEndpoint.DISCOUNT_ENDPOINT}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: query,
  });
};

export const GetDiscountDetail = async (id, token) => {
  return await axios.get(`${APIEndpoint.DISCOUNT_ENDPOINT}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const CreateDiscountService = async (data, token) => {
  return await axios.post(`${APIEndpoint.DISCOUNT_ENDPOINT}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const UpdateDiscountService = async (id, data, token) => {
  return await axios.patch(`${APIEndpoint.DISCOUNT_ENDPOINT}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const DeleteMultiDiscountService = async (ids, token) => {
  return await axios.delete(`${APIEndpoint.DISCOUNT_ENDPOINT}/multi?${ids}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
