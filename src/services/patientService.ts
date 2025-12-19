import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";

export interface Patient {
  patientId: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePatientRequest {
  name: string;
  email: string;
  phone: string;
}

export const usePatientService = () => {
  const queryClient = useQueryClient();

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

  const searchPatients = (keyword: string) => {
    return useQuery({
      queryKey: ["patients", keyword],
      queryFn: async () => {
        const response = await axiosInstance.get<Patient[]>(`/patient`);
        const patients = response.data;

        return patients.filter(
          (patient) =>
            patient.name.toLowerCase().includes(keyword.toLowerCase()) ||
            patient.email.toLowerCase().includes(keyword.toLowerCase()) ||
            patient.phone.toLowerCase().includes(keyword.toLowerCase())
        );
      },
      enabled: !!keyword,
    });
  };

  const createPatient = useMutation({
    mutationFn: (data: CreatePatientRequest) =>
      axiosInstance
        .post<{ patientId: string }>("/patient", data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  return {
    getPatientById,
    searchPatients,
    createPatient,
  };
};
