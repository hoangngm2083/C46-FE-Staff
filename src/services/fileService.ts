import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";

export interface FileUploadResponse {
  name: string;
  size: number;
  type: string;
  url: string;
}

export const useFileService = () => {
  const uploadFile = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return axiosInstance
        .post<FileUploadResponse>("/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => res.data);
    },
  });

  const deleteFile = useMutation({
    mutationFn: (url: string) =>
      axiosInstance
        .delete("/files/delete", {
          params: { url },
        })
        .then((res) => res.data),
  });

  return {
    uploadFile,
    deleteFile,
  };
};
