import axios from "./axios";
import * as APIEndpoint from "./ApiEndpoint";

export const GetProductReviewsService = async (productId) => {
  return await axios.get(`${APIEndpoint.REVIEW_ENDPOINT}/product/${productId}`);
};

export const GetReviewableService = async (query, token) => {
  return await axios.get(`${APIEndpoint.REVIEW_ENDPOINT}/reviewable`, {
    params: query,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const SubmitReviewService = async (data, token) => {
  return await axios.post(`${APIEndpoint.REVIEW_ENDPOINT}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
