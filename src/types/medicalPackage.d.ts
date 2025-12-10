declare global {
  interface IMedicalPackage {
    medicalPackageId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    services: MedicalServiceDTO[];
  }

  // Request types
  interface CreateMedicalPackageRequest {
    name: string;
    description: string;
    serviceIds: string[];
    price: number;
    image: string;
  }

  interface CreateMedicalServiceRequest {
    name: string;
    description: string;
    departmentId: string;
    processingPriority: number;
    formTemplate: string;
  }

  interface UpdateMedicalPackageInfoRequest {
    name: string;
    description: string;
    image: string;
    serviceIds: string[];
  }

  interface UpdateMedicalPackagePriceRequest {
    price: number;
  }

  interface UpdateMedicalServiceRequest {
    name: string;
    description: string;
    departmentId: string;
    processingPriority: number;
    formTemplate: string;
  }

  interface MedicalServiceDTO {
    medicalServiceId: string;
    name: string;
    processingPriority: number;
    description: string;
    departmentId: string;
    departmentName: string;
    formTemplate: string;
  }

  interface MedicalPackageDetailDTO {
    medicalPackageId: string;
    name: string;
    description: string;
    price: number;
    medicalServices: MedicalServiceDTO[];
    image: string;
  }

  interface GetMedicalPackagesParams {
    page?: number;
    size?: number;
    keyword?: string;
    sort?: "ASC" | "DESC";
  }

  interface GetMedicalServicesParams {
    page?: number;
    size?: number;
    keyword?: string;
  }
}

export {};
