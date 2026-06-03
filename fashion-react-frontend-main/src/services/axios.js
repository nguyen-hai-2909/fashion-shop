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
    const data = error?.response?.data;
    const msg = String(data?.message || "");
    if (
      error?.response?.status === 403 &&
      msg.toLowerCase().includes("locked")
    ) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
    return (
      data ?? {
        success: false,
        message: error?.message || "Network error",
      }
    );
  }
);

export default instance;
