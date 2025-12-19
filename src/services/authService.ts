import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "./axios-instance";
import { useNavigate } from "react-router-dom";

const useAuthService = (params?: {
  verificationId?: string;
  code?: string;
  accountName?: string;
  password?: string;
}) => {
  const calculateInitialToken = () => {
    const tokens = localStorage.getItem("tokens");
    if (tokens) {
      try {
        return JSON.parse(tokens)?.token;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const [initialToken] = useState(calculateInitialToken);

  const { verificationId, code, accountName, password } = params ?? {};
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const emailVerification = useQuery({
    queryKey: ["emailVerification", verificationId, code],
    queryFn: () => {
      return axiosInstance
        .get<string>(`/auth/otp/email`, {
          params: { verificationId, code },
        })
        .then((res) => res.data);
    },
    enabled: !!verificationId && !!code,
    retry: false,
  });

  const login = useQuery({
    queryKey: ["login", accountName],
    retry: false,
    queryFn: () => {
      const tokens = localStorage.getItem("tokens");
      if (tokens) {
        try {
          return Promise.resolve(
            JSON.parse(tokens) as {
              token: string;
              refreshToken: string;
            }
          );
        } catch (e) {}
      }
      return axiosInstance
        .post<{
          token: string;
          refreshToken: string;
        }>("/auth/login", {
          accountName,
          password,
        })
        .then((res) => {
          localStorage.setItem("tokens", JSON.stringify(res.data));
          return res.data;
        });
    },
    enabled: false,
  });

  const account = useQuery({
    queryKey: ["me"],
    queryFn: () => {
      return axiosInstance
        .get<IAccount>("/auth/me")
        .then((res) => res.data);
    },
    enabled: !!login.data?.token || !!initialToken,
  });

  const logout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem("tokens");
    
    // Clear all queries from cache
    queryClient.clear();
    
    // Navigate to login page
    navigate("/login");
  };

  return {
    emailVerification,
    login,
    account,
    logout,
  };
};

export default useAuthService;
