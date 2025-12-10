import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import usePaymentService from "../../../services/paymentService";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaHome,
  FaPrint,
} from "react-icons/fa";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const { processPaymentResult } = usePaymentService();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handlePaymentResult = async () => {
      try {
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Check if we have VNPAY params
        if (!params["vnp_SecureHash"]) {
          setStatus("error");
          setMessage("Thông tin thanh toán không hợp lệ");
          return;
        }

        await processPaymentResult.mutateAsync(params);

        // Check response code from VNPAY params directly for immediate UI feedback
        // 00 is success
        if (params["vnp_ResponseCode"] === "00") {
          setStatus("success");
          setMessage("Thanh toán thành công");
        } else {
          setStatus("error");
          setMessage("Thanh toán thất bại hoặc bị hủy");
        }
      } catch (error) {
        console.error("Payment processing error:", error);
        setStatus("error");
        setMessage("Lỗi khi xử lý kết quả thanh toán");
      }
    };

    handlePaymentResult();
  }, []); // Run once on mount

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseInt(amount) / 100); // VNPAY amount is multiplied by 100
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    // Format: yyyyMMddHHmmss
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-8 text-center">
          {status === "loading" && (
            <div className="py-12">
              <FaSpinner className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-700">
                Đang xử lý kết quả thanh toán...
              </h2>
              <p className="text-slate-500 mt-2">
                Vui lòng không tắt trình duyệt
              </p>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-slate-500 mb-8">{message}</p>

              <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã giao dịch:</span>
                  <span className="font-mono font-medium text-slate-700">
                    {searchParams.get("vnp_TransactionNo")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền:</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(searchParams.get("vnp_Amount") || "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-medium text-slate-700">
                    {searchParams.get("vnp_BankCode")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian:</span>
                  <span className="font-medium text-slate-700">
                    {formatDate(searchParams.get("vnp_PayDate") || "")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nội dung:</span>
                  <span className="font-medium text-slate-700 text-right max-w-[200px] truncate">
                    {searchParams.get("vnp_OrderInfo")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FaPrint />
                  In biên lai
                </button>
                <button
                  onClick={() => window.close()}
                  className="flex-1 py-3 px-4 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaCheckCircle />
                  Hoàn tất
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTimesCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Thanh toán thất bại
              </h2>
              <p className="text-slate-500 mb-8">{message}</p>

              <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã lỗi:</span>
                  <span className="font-mono font-medium text-red-600">
                    {searchParams.get("vnp_ResponseCode")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã giao dịch:</span>
                  <span className="font-mono font-medium text-slate-700">
                    {searchParams.get("vnp_TransactionNo")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => window.close()}
                className="w-full py-3 px-4 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
              >
                <FaHome />
                Trở về trang chủ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
