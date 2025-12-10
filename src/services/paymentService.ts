import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";

export interface MedicalPackageRepDto {
  id: string;
  name: string;
  price: number;
}

export interface InvoiceDto {
  invoiceId: string;
  patientId: string;
  medicalPackages: MedicalPackageRepDto[];
  totalAmount: number;
  status: string;
}

export interface CreateTransactionRequest {
  invoiceId: string;
  paymentMethod: string;
}

export interface CreateTransactionResponse {
  transactionId: string;
  paymentUrl: string;
}

export interface TransactionDto {
  transactionId: string;
  invoiceId: string;
  staffId: string;
  paymentMethod: string;
  amount: number;
  status: string;
  gatewayTransactionId: string;
}

export interface TransactionStatusDto {
  transactionId: string;
  invoiceId: string;
  status: string;
}

const usePaymentService = ({
  invoiceId,
  transactionId,
}: {
  invoiceId?: string;
  transactionId?: string;
} = {}) => {

  const invoice = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () =>
      axiosInstance
        .get<InvoiceDto>(`/payment/invoices/${invoiceId}`)
        .then((res) => res.data),
    enabled: !!invoiceId,
  });

  const createTransaction = useMutation({
    mutationFn: ({
      request,
      staffId,
    }: {
      request: CreateTransactionRequest;
      staffId: string;
    }) =>
      axiosInstance
        .post<CreateTransactionResponse>("/payment/transactions", request, {
          headers: {
            "Staff-Id": staffId,
          },
        })
        .then((res) => res.data),
    onSuccess: () => {
      // Invalidate relevant queries if needed
    },
  });

  const transaction = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () =>
      axiosInstance
        .get<TransactionDto>(`/payment/transactions/${transactionId}`)
        .then((res) => res.data),
    enabled: !!transactionId,
  });

  const transactionStatus = useQuery({
    queryKey: ["transactionStatus", transactionId],
    queryFn: () =>
      axiosInstance
        .get<TransactionStatusDto>(`/payment/transactions/${transactionId}/status`)
        .then((res) => res.data),
    enabled: !!transactionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop refetching if status is final (e.g., SUCCESS or FAILED)
      // Assuming 'PENDING' or similar is the intermediate state.
      // You might need to adjust this logic based on your exact status enums.
      if (status === "SUCCESS" || status === "FAILED" || status === "CANCELLED") {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  const processPaymentResult = useMutation({
    mutationFn: (params: Record<string, string>) =>
      axiosInstance
        .get("/payment/ipn", { params })
        .then((res) => res.data),
  });

  return {
    invoice,
    createTransaction,
    transaction,
    transactionStatus,
    processPaymentResult,
  };
};

export default usePaymentService;
