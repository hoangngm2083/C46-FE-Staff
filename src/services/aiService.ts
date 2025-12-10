import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";

export interface IChatRequest {
  message: string;
  session_id?: string;
}

export interface IChatResponse {
  response: string;
  suggested_actions: string[];
  session_id?: string;
  timestamp: string;
  error?: string;
}

export interface IHealthResponse {
  status: string;
  version: string;
  services: {
    vector_store: boolean;
    clinic_api: boolean;
    agent: boolean;
  };
}

const useAIService = () => {
  const sendMessage = useMutation({
    mutationFn: (args: IChatRequest) =>
      axiosInstance
        .post<IChatResponse>("/ai/chat", args)
        .then((res) => res.data),
  });

  const getChatHistory = (sessionId: string) =>
    useQuery({
      queryKey: ["chatHistory", sessionId],
      queryFn: () =>
        axiosInstance
          .get<{ history: any[] }>(`/ai/chat/history/${sessionId}`)
          .then((res) => res.data),
      enabled: !!sessionId,
    });

  const checkHealth = useQuery({
    queryKey: ["aiHealth"],
    queryFn: () =>
      axiosInstance
        .get<IHealthResponse>("/ai/health")
        .then((res) => res.data),
  });

  return {
    sendMessage,
    getChatHistory,
    checkHealth,
  };
};

export default useAIService;
