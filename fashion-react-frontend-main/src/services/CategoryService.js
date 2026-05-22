import axios from "./axios";
import * as APIEndpoint from "./ApiEndpoint";

export const GetCategoriesService = async (query = {}) => {
  return await axios.get(APIEndpoint.CATEGORY_ENDPOINT, { params: query });
};

export const CreateCategoryService = async (data, token) => {
  return await axios.post(APIEndpoint.CATEGORY_ENDPOINT, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const UpdateCategoryService = async (id, data, token) => {
  return await axios.patch(`${APIEndpoint.CATEGORY_ENDPOINT}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const ToggleCategoryService = async (id, token) => {
  return await axios.patch(
    `${APIEndpoint.CATEGORY_ENDPOINT}/${id}/toggle`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const DeleteCategoryService = async (id, token) => {
  return await axios.delete(`${APIEndpoint.CATEGORY_ENDPOINT}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
