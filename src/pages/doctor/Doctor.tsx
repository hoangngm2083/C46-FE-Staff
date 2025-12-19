import { useState, useEffect, useRef } from "react";
import LogoutButton from "../../components/LogoutButton";
import { FaUserDoctor, FaUserInjured, FaClipboardList } from "react-icons/fa6";
import {
  examinationFlowService,
  QueueItemResponse,
} from "../../services/examinationFlowService";
import useExaminationService from "../../services/examinationService";
import toast from "react-hot-toast";
import useAuthService from "@/services/authService";
import useStaffService from "@/services/staffService";

export default function Doctor() {
  const { account } = useAuthService();
  const staffId = account.data?.staffId;
  const { staff } = useStaffService({ staffId });
  const { createResult } = useExaminationService();

  const [wsConnected, setWsConnected] = useState(false);
  const [queueSize, setQueueSize] = useState<number>(0);
  const [currentQueueItem, setCurrentQueueItem] =
    useState<QueueItemResponse | null>(null);
  const [activeTab, setActiveTab] = useState("service");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [formData, setFormData] = useState<any>(null);

  // Extract doctor info from staff data
  const doctorName = staff.data?.name || "Doctor";
  const departmentId = staff.data?.departmentId || null;

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "rendererReady") {
        // Send schema when renderer is ready
        if (
          currentQueueItem?.requestedService?.formTemplate &&
          iframeRef.current?.contentWindow
        ) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: "renderForm",
              schema: currentQueueItem.requestedService.formTemplate,
            },
            "*"
          );
        }
      } else if (event.data.type === "formChange") {
        setFormData(event.data.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentQueueItem]);

  // Send schema when currentQueueItem changes and iframe is already loaded
  useEffect(() => {
    if (
      currentQueueItem?.requestedService?.formTemplate &&
      iframeRef.current?.contentWindow
    ) {
      // Small delay to ensure iframe is ready if it's just being mounted
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "renderForm",
            schema: currentQueueItem.requestedService!.formTemplate,
          },
          "*"
        );
      }, 500);
    }
  }, [currentQueueItem, activeTab]);

  // Connect to ExaminationFlow WebSocket
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        if (examinationFlowService.isConnected()) {
          return;
        }
        // Get JWT token from localStorage
        const tokensStr = localStorage.getItem("tokens");
        if (!tokensStr) {
          console.warn("No authentication token found");
          return;
        }
        // Connect to WebSocket
        examinationFlowService.connect(
          // tokens.token,
          staffId!,
          () => {
            console.log("Successfully connected to ExaminationFlow WebSocket");
            setWsConnected(true);
            toast.success("Đã kết nối hàng đợi khám bệnh");

            // Subscribe to queue items
            examinationFlowService.subscribeToQueueItems(
              (item: QueueItemResponse) => {
                console.log("Received queue item:", item);
                setCurrentQueueItem(item);
                toast.success("Nhận được bệnh nhân mới từ hàng đợi");
              }
            );

            // Subscribe to queue size updates
            examinationFlowService.subscribeToQueueSize((size: number) => {
              console.log("Queue size updated:", size);
              setQueueSize(size);
            });

            // Subscribe to errors
            examinationFlowService.subscribeToErrors((error: string) => {
              console.error("Queue error:", error);
              toast.error(error);
            });

            // Get in-progress item if any
            examinationFlowService.getInProgressItem();

            // Query queue size if departmentId is available
            if (departmentId) {
              examinationFlowService.subscribeToQueueBroadcast(
                departmentId,
                (size: number) => {
                  console.log("Queue size updated:", size);
                  setQueueSize(size);
                }
              );

              examinationFlowService.queryQueueSize(departmentId);
              // Subscribe to queue broadcasts for this department
              examinationFlowService.subscribeToQueueBroadcast(
                departmentId,
                (data: any) => {
                  console.log("Queue broadcast update:", data);
                }
              );
            }
          },
          (error) => {
            console.error("WebSocket connection error:", error);
            setWsConnected(false);
            toast.error("Không thể kết nối hàng đợi khám bệnh");
          }
        );
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        toast.error("Lỗi khi kết nối hàng đợi");
      }
    };

    if (staffId && departmentId) {
      connectWebSocket();
    }

    // Cleanup on unmount
    return () => {
      if (examinationFlowService.isConnected()) {
        examinationFlowService.disconnect();
        setWsConnected(false);
      }
    };
  }, [staffId, departmentId]);

  // Function to take next patient from queue
  const handleTakeNextPatient = () => {
    if (!departmentId) {
      toast.error("Không tìm thấy thông tin phòng ban");
      return;
    }

    if (!examinationFlowService.isConnected()) {
      toast.error("Chưa kết nối đến hàng đợi");
      return;
    }

    examinationFlowService.takeNextItem(departmentId);
    toast.loading("Đang lấy bệnh nhân tiếp theo...", { duration: 2000 });
  };

  // Function to complete current patient
  const handleCompletePatient = async (
    examId: string,
    serviceId: string,
    data: any
  ) => {
    if (!currentQueueItem) {
      toast.error("Không có bệnh nhân đang khám");
      return;
    }

    if (!staffId) {
      toast.error("Không tìm thấy thông tin bác sĩ");
      return;
    }

    try {
      await createResult.mutateAsync({
        examId,
        request: {
          serviceId,
          data,
        },
        staffId,
      });
      toast.success("Đã hoàn thành khám bệnh");
      setCurrentQueueItem(null);
      setFormData(null);
    } catch (error) {
      console.error("Error completing examination:", error);
      toast.error("Lỗi khi hoàn thành khám bệnh");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center overflow-hidden">
              {staff.data?.image ? (
                <img
                  src={staff.data.image}
                  alt={doctorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserDoctor className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Bảng điều khiển dành cho bác sĩ
              </h1>
              <p className="text-sm text-slate-400">{doctorName}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Queue Status Card - New */}
        {
          <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    wsConnected ? "bg-green-400" : "bg-gray-400"
                  }`}
                ></div>
                <h3 className="text-lg font-semibold">
                  Hàng đợi khám bệnh{" "}
                  {wsConnected ? "(Đã kết nối)" : "(Đang kết nối...)"}
                </h3>
              </div>
              <button
                onClick={handleTakeNextPatient}
                disabled={!wsConnected || !!currentQueueItem}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  !wsConnected || !!currentQueueItem
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-600 text-white"
                }`}
              >
                <FaUserInjured className="w-4 h-4" />
                <span>Lấy bệnh nhân tiếp theo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-slate-400">Số bệnh nhân đang chờ</p>
                <p className="text-2xl font-bold text-cyan-400">{queueSize}</p>
              </div>
            </div>

            {/* Current Patient & Package Info */}
            {currentQueueItem && (
              <div className="mt-6 space-y-6">
                {/* Top Panel: Patient & Package Info */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Patient Info */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-400">
                      <FaUserInjured />
                      Thông tin bệnh nhân
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Mã bệnh nhân:</span>
                        <span className="text-white font-mono">
                          {currentQueueItem.medicalForm?.examination
                            ?.patientId || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Họ và tên:</span>
                        <span className="text-white font-medium">
                          {currentQueueItem.medicalForm?.examination
                            ?.patientName || "Đang tải..."}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Email:</span>
                        <span className="text-white">
                          {currentQueueItem.medicalForm?.examination
                            ?.patientEmail || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Mã hồ sơ:</span>
                        <span className="text-white font-mono">
                          {currentQueueItem.medicalForm?.id || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Panel: Service Tabs */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  {/* Tabs Header */}
                  <div className="flex space-x-6 border-b border-white/10 mb-6">
                    <button
                      className={`pb-3 px-2 font-medium transition-colors relative flex items-center gap-2 ${
                        activeTab === "service"
                          ? "text-cyan-400"
                          : "text-slate-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("service")}
                    >
                      <FaClipboardList />
                      {currentQueueItem.requestedService?.name ||
                        "Dịch vụ khám"}
                      {activeTab === "service" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400" />
                      )}
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[200px]">
                    {activeTab === "service" && (
                      <div className="space-y-4">
                        {/* Form Template Placeholder */}
                        <div className="bg-white rounded-lg p-4 min-h-[400px]">
                          <iframe
                            ref={iframeRef}
                            src="/formio-renderer.html"
                            className="w-full h-full min-h-[400px] border-0"
                            title="Medical Form"
                          />
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            onClick={() => {
                              if (
                                currentQueueItem.medicalForm?.examination?.id &&
                                currentQueueItem.requestedService?.serviceId
                              ) {
                                handleCompletePatient(
                                  currentQueueItem.medicalForm.examination.id,
                                  currentQueueItem.requestedService.serviceId,
                                  formData || {}
                                );
                              } else {
                                toast.error(
                                  "Thiếu thông tin để hoàn thành khám bệnh"
                                );
                              }
                            }}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-500/20"
                          >
                            Hoàn thành khám bệnh
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        }

        {/* User Info Card */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-4">Thông tin tài khoản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Email</p>
              <p className="text-white font-medium">
                {staff.data?.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Chức vụ</p>
              <p className="text-blue-400 font-medium capitalize">
                {staff.data?.role === 0
                  ? "Doctor"
                  : staff.data?.role === 1
                  ? "Receptionist"
                  : staff.data?.role === 2
                  ? "Manager"
                  : staff.data?.role === 3
                  ? "Admin"
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Họ và tên</p>
              <p className="text-white font-medium">{doctorName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Phòng ban</p>
              <p className="text-white font-medium">
                {staff.data?.departmentName || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
