import axios from "axios";

const baseURL =
  import.meta.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL_DEV;

/** Dedicated client so global axios "return error body" interceptor does not swallow failures. */
const uploadClient = axios.create({ baseURL });

/**
 * Upload one image to the API; backend stores on Cloudinary and returns secure URL.
 * @param {File} file
 * @param {string} token Admin JWT
 * @returns {Promise<{ success: boolean, url: string, original_filename: string, asset_id: string }>}
 */
export const uploadProductImage = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await uploadClient.post("uploads/image", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!data?.success) {
    throw new Error(data?.message || "Upload failed");
  }
  return data;
};
