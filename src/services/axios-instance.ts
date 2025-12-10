import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

// Initialize FingerprintJS and add request interceptor
const fpPromise = FingerprintJS.load();

// Track if a token refresh is in progress
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const fp = await fpPromise;
    const result = await fp.get();
    config.headers.Fingerprint = result.visitorId;

    // Add bearer token if available
    const tokens = localStorage.getItem("tokens");
    if (tokens) {
      try {
        const { token } = JSON.parse(tokens);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {}
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const tokens = localStorage.getItem("tokens");
      if (!tokens) {
        // No tokens available, redirect to login
        localStorage.removeItem("tokens");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { refreshToken } = JSON.parse(tokens);

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Request new token using refresh token
        const response = await axios.post(
          `/auth/refresh`,
          { refreshToken },
          {
            baseURL: axiosInstance.defaults.baseURL,
          }
        );

        const { token: newToken, refreshToken: newRefreshToken } =
          response.data;

        // Update tokens in localStorage
        localStorage.setItem(
          "tokens",
          JSON.stringify({
            token: newToken,
            refreshToken: newRefreshToken || refreshToken,
          })
        );

        // Update the authorization header
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Process queued requests
        processQueue(null, newToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem("tokens");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
