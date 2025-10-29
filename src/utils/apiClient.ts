import axios from "axios";
import config from "../config";

const apiClient = axios.create({
  baseURL: config.BASE_PROXY_URL,
});

apiClient.interceptors.request.use(
  (axiosConfig) => {
    axiosConfig.params = {
      ...axiosConfig.params,
      api_key: config.SERVICE_KEY,
    };
    return axiosConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { apiClient };
