import axios from "./axios";
import * as APIEndpoint from "./ApiEndpoint";

export const GetAllProductsService = async (query) => {
  return await axios.get(APIEndpoint.PRODUCTS_ENDPOINT, { params: query });
};

export const GetDetailProductService = async (identifier) => {
  return await axios.get(`${APIEndpoint.PRODUCTS_ENDPOINT}/${identifier}`);
};

export const CreateProductService = async (data, token) => {
  return await axios.post(`${APIEndpoint.PRODUCTS_ENDPOINT}/create`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const UpdateProductService = async (id, data, token) => {
  return await axios.patch(`${APIEndpoint.PRODUCTS_ENDPOINT}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const ToggleProductStorefrontService = async (id, token) => {
  return await axios.patch(
    `${APIEndpoint.PRODUCTS_ENDPOINT}/${id}/toggle-active`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const GetChatbotCatalogService = async () => {
  return await axios.get(`${APIEndpoint.PRODUCTS_ENDPOINT}/chatbot-catalog`);
};

export const RemoveProductService = async (ids, token) => {
  return await axios.delete(
    `${APIEndpoint.PRODUCTS_ENDPOINT}/multiple?${ids}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
