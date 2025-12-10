import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";

const useMedicalPackageService = (params?: {
  medicalPackagesParams?: GetMedicalPackagesParams;
  medicalServicesParams?: GetMedicalServicesParams;
  medicalPackageId?: string;
  medicalServiceId?: string;
}) => {
  const queryClient = useQueryClient();
  const {
    medicalPackagesParams,
    medicalServicesParams,
    medicalPackageId,
    medicalServiceId,
  } = params ?? {};

  // Queries
  const medicalPackages = useQuery({
    queryKey: ["medical-packages", medicalPackagesParams],
    queryFn: () =>
      axiosInstance
        .get<Pagination<IMedicalPackage>>("/medical-package", {
          params: { size: 5, ...medicalPackagesParams },
        })
        .then((res) => res.data),
    enabled: !!medicalPackagesParams,
  });

  const medicalPackage = useQuery({
    queryKey: ["medical-package", medicalPackageId],
    queryFn: () =>
      axiosInstance
        .get<MedicalPackageDetailDTO>(`/medical-package/${medicalPackageId}`)
        .then((res) => res.data),
    enabled: !!medicalPackageId,
  });

  const medicalServices = useQuery({
    queryKey: ["medical-services", medicalServicesParams],
    queryFn: () =>
      axiosInstance
        .get<Pagination<MedicalServiceDTO>>("/medical-service", {
          params: { size: 5, ...medicalServicesParams },
        })
        .then((res) => res.data),
    enabled: !!medicalServicesParams,
  });

  const medicalService = useQuery({
    queryKey: ["medical-service", medicalServiceId],
    queryFn: () =>
      axiosInstance
        .get<MedicalServiceDTO>(`/medical-service/${medicalServiceId}`)
        .then((res) => res.data),
    enabled: !!medicalServiceId,
  });

  // Mutations
  const createMedicalPackage = useMutation({
    mutationFn: (request: CreateMedicalPackageRequest) =>
      axiosInstance
        .post<{ medicalPackageId: string }>("/medical-package", request)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-packages"] });
    },
  });

  const createMedicalService = useMutation({
    mutationFn: (request: CreateMedicalServiceRequest) =>
      axiosInstance
        .post<{ medicalServiceId: string }>("/medical-service", request)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-services"] });
    },
  });

  const updateMedicalPackageInfo = useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateMedicalPackageInfoRequest;
    }) =>
      axiosInstance
        .put(`/medical-package/${id}`, request)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-packages"] });
      queryClient.invalidateQueries({ queryKey: ["medical-package"] });
    },
  });

  const updateMedicalPackagePrice = useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateMedicalPackagePriceRequest;
    }) =>
      axiosInstance
        .patch(`/medical-package/${id}`, request)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-packages"] });
      queryClient.invalidateQueries({ queryKey: ["medical-package"] });
    },
  });

  const deleteMedicalPackage = useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(`/medical-package/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-packages"] });
    },
  });

  const updateMedicalService = useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateMedicalServiceRequest;
    }) =>
      axiosInstance
        .put(`/medical-service/${id}`, request)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-services"] });
      queryClient.invalidateQueries({ queryKey: ["medical-service"] });
    },
  });

  const deleteMedicalService = useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(`/medical-service/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-services"] });
    },
  });

  const getMedicalService = (id: string) =>
    axiosInstance
      .get<MedicalServiceDTO>(`/medical-service/${id}`)
      .then((res) => res.data);

  return {
    // Queries
    medicalPackages,
    medicalPackage,
    medicalServices,
    medicalService,
    getMedicalService,
    // Mutations
    createMedicalPackage,
    createMedicalService,
    updateMedicalPackageInfo,
    updateMedicalPackagePrice,
    deleteMedicalPackage,
    updateMedicalService,
    deleteMedicalService,
  };
};

export default useMedicalPackageService;
