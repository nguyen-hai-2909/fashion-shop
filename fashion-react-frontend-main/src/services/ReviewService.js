import axios from "./axios";
import * as APIEndpoint from "./ApiEndpoint";
import { normalizeAuthToken } from "../utils/authToken";

const authHeader = (token) => ({
  Authorization: `Bearer ${normalizeAuthToken(token)}`,
});

export const GetProductReviewsService = async (productId) => {
  return await axios.get(`${APIEndpoint.REVIEW_ENDPOINT}/product/${productId}`);
};

export const GetReviewableService = async (query, token) => {
  return await axios.get(`${APIEndpoint.REVIEW_ENDPOINT}/reviewable`, {
    params: query,
    headers: authHeader(token),
  });
};

export const SubmitReviewService = async (data, token) => {
  return await axios.post(`${APIEndpoint.REVIEW_ENDPOINT}`, data, {
    headers: authHeader(token),
  });
};

export const GetOrderReviewItemsService = async (orderId, token) => {
  return await axios.get(`${APIEndpoint.REVIEW_ENDPOINT}/order/${orderId}`, {
    headers: authHeader(token),
  });
};

export const GetOrderReviewItemService = async (orderId, itemIndex, token) => {
  return await axios.get(
    `${APIEndpoint.REVIEW_ENDPOINT}/order/${orderId}/${itemIndex}`,
    { headers: authHeader(token) }
  );
};

export const SubmitOrderReviewService = async (orderId, itemIndex, data, token) => {
  return await axios.post(
    `${APIEndpoint.REVIEW_ENDPOINT}/order/${orderId}/${itemIndex}`,
    data,
    { headers: authHeader(token) }
  );
};
