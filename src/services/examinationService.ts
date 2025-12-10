import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";

export interface ExamViewDto {
  id: string;
  patientId: string;
  medicalFormId: string;
  patientName: string;
  patientEmail: string;
}

export interface ExamsPagedDto {
  content: ExamViewDto[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface CreateResultRequest {
  serviceId: string;
  data: any;
}

export interface ISearchExaminationsParams {
  keyword?: string;
  page?: number;
  size?: number;
}

const useExaminationService = ({
  examId,
  searchParams,
}: {
  examId?: string;
  searchParams?: ISearchExaminationsParams;
} = {}) => {
  const queryClient = useQueryClient();

  const searchExaminations = useQuery({
    queryKey: ["examinations", searchParams],
    queryFn: () =>
      axiosInstance
        .get<ExamsPagedDto>("/examination", {
          params: { size: 5, ...searchParams },
        })
        .then((res) => res.data),
    enabled: !!searchParams,
  });

  const examination = useQuery({
    queryKey: ["examination", examId],
    queryFn: () =>
      axiosInstance
        .get<any>(`/examination/${examId}`)
        .then((res) => res.data),
    enabled: !!examId,
  });

  const createResult = useMutation({
    mutationFn: ({
      examId,
      request,
      staffId,
    }: {
      examId: string;
      request: CreateResultRequest;
      staffId: string;
    }) =>
      axiosInstance.post(`/examination/${examId}/result`, request, {
        headers: {
          "Staff-Id": staffId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["examinations"] });
      if (examId) {
        queryClient.invalidateQueries({ queryKey: ["examination", examId] });
      }
    },
  });

  return {
    searchExaminations,
    examination,
    createResult,
  };
};

export default useExaminationService;
