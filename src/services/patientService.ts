import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export const usePatientService = () => {
  const getPatientById = (id: string | undefined) => {
    return useQuery({
      queryKey: ["patient", id],
      queryFn: async () => {
        if (!id) return null;
        const response = await axiosInstance.get<Patient>(`/patient/${id}`);
        return response.data;
      },
      enabled: !!id,
    });
  };

  return {
    getPatientById,
  };
};
