import axios from "axios";

const baseURL =
  import.meta.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL_DEV;

const instance = axios.create({
  baseURL: baseURL,
});

instance.interceptors.response.use(
  function (response) {
    return response?.data;
  },
  function (error) {
    return error?.response?.data;
  }
);

export default instance;
