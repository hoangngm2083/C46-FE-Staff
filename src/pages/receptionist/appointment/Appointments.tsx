import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import LogoutButton from "../../../components/LogoutButton";
import {
  Plus,
  Edit,
  Calendar,
  X,
  Search,
  Filter,
  UserCheck,
  Clock,
  Check,
  AlertTriangle,
  Trash2,
  Eye,
} from "lucide-react";
import useAuthService from "@/services/authService";
import useBookingService from "@/services/bookingService";
import { useExaminationFlowService } from "@/services/examinationFlowService";
import { FaArrowLeft } from "react-icons/fa6";
import CreateMedicalForm from "./CreateMedicalForm";

type AppointmentFilterStatus = "ALL" | AppointmentState;

export default function Appointments() {
  const { account } = useAuthService();
  const [viewMode, setViewMode] = useState<"LIST" | "CREATE_FORM">("LIST");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<AppointmentFilterStatus>("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<IAppointment | null>(null);

  // Fetch appointments with filters
  const {
    appointments,
    createAppointment,
    updateAppointmentState,
    deleteAppointment,
    appointment,
  } = useBookingService({
    appointmentsParams: {
      page: currentPage,
      keyword: searchKeyword || undefined,
      state: filterStatus !== "ALL" ? filterStatus : undefined,
      dateFrom: filterDateFrom || undefined,
      dateTo: filterDateFrom || undefined,
      sort: "DESC",
    },
    appointmentId: selectedAppointment?.id,
  });

  const { createMedicalForm } = useExaminationFlowService();

  // Form state
  const [formData, setFormData] = useState<ICreateAppointmentRequest>({
    patientId: "",
    slotId: "",
  });

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment.mutateAsync(formData);
      toast.success("Tạo lịch hẹn thành công");
      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo lịch hẹn");
    }
  };

  const handleUpdateState = async (
    appointmentId: string,
    newState: AppointmentState
  ) => {
    try {
      await updateAppointmentState.mutateAsync({
        appointmentId,
        state: newState,
      });
      if (newState === "SHOWED" && appointment.data) {
        await createMedicalForm.mutateAsync({
          patientId: appointment.data.patientId,
          medicalPackageIds: [appointment.data.medicalPackageId],
        });
      }
      await toast.success("Cập nhật trạng thái thành công");
      setShowEditModal(false);
      setSelectedAppointment(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái"
      );
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch hẹn này?")) return;

    try {
      await deleteAppointment.mutateAsync(appointmentId);
      toast.success("Xóa lịch hẹn thành công");
      setSelectedAppointment(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa lịch hẹn");
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      slotId: "",
    });
  };

  const getStatusColor = (state: AppointmentState) => {
    switch (state) {
      case "CREATED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "SHOWED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "CANCELED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "NO_SHOWED":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusLabel = (state: AppointmentState) => {
    switch (state) {
      case "CREATED":
        return "Đã tạo";
      case "SHOWED":
        return "Đã đến";
      case "CANCELED":
        return "Đã hủy";
      case "NO_SHOWED":
        return "Không đến";
      default:
        return state;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {viewMode === "CREATE_FORM" ? (
              <button
                onClick={() => setViewMode("LIST")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white mr-2"
              >
                <FaArrowLeft />
              </button>
            ) : (
              <Link
                to="/receptionist"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white mr-2"
              >
                <FaArrowLeft />
              </Link>
            )}
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Quản lý lịch hẹn</h1>
              <p className="text-sm text-slate-400">
                {account.data?.accountName || "Receptionist"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {viewMode === "CREATE_FORM" ? (
          <CreateMedicalForm onSuccess={() => setViewMode("LIST")} />
        ) : (
          <>
            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên bệnh nhân, số điện thoại..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as AppointmentFilterStatus)
                    }
                    className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 appearance-none cursor-pointer"
                  >
                    <option className="text-black" value="ALL">
                      Tất cả
                    </option>
                    <option className="text-black" value="CREATED">
                      Đã tạo
                    </option>
                    <option className="text-black" value="SHOWED">
                      Đã đến
                    </option>
                    <option className="text-black" value="CANCELED">
                      Đã hủy
                    </option>
                    <option className="text-black" value="NO_SHOWED">
                      Không đến
                    </option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <button
                  onClick={() => setViewMode("CREATE_FORM")}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Tạo phiếu khám</span>
                </button>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              {appointments.isLoading || appointments.isRefetching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                </div>
              ) : !appointments.data?.content ||
                appointments.data.content.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    Không tìm thấy lịch hẹn
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">
                            Bệnh nhân
                          </th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">
                            Ngày hẹn
                          </th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">
                            Gói khám
                          </th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">
                            Trạng thái
                          </th>
                          <th className="text-right py-3 px-4 text-slate-400 font-medium">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.data.content.map((apt) => (
                          <tr
                            key={apt.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                                  <UserCheck className="w-5 h-5 text-cyan-400" />
                                </div>
                                <span className="font-medium">
                                  {apt.patientName}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-300">
                                  {apt.date}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-300">
                              {apt.medicalPackageName || "N/A"}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  apt.state
                                )}`}
                              >
                                {getStatusLabel(apt.state)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(apt);
                                    setShowDetailsModal(true);
                                  }}
                                  className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                                  title="Xem chi tiết"
                                >
                                  <Eye className="w-4 h-4 text-blue-400" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(apt);
                                    setShowEditModal(true);
                                  }}
                                  className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors"
                                  title="Cập nhật trạng thái"
                                >
                                  <Edit className="w-4 h-4 text-green-400" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteAppointment(apt.id)
                                  }
                                  className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-slate-400">
                      Hiển thị {appointments.data.content.length} /{" "}
                      {appointments.data.total} lịch hẹn
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Trước
                      </button>
                      <span className="px-4 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg">
                        {currentPage} / {appointments.data.totalPages || 1}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={
                          currentPage >= (appointments.data.totalPages || 1)
                        }
                        className="px-3 py-1 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
              <h2 className="text-xl font-bold">Tạo lịch hẹn mới</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Patient ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData({ ...formData, patientId: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Nhập Patient ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slot ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slotId}
                    onChange={(e) =>
                      setFormData({ ...formData, slotId: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Nhập Slot ID"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createAppointment.isPending}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {createAppointment.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tạo lịch hẹn</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">Cập nhật trạng thái</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAppointment(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Bệnh nhân</p>
                <p className="text-white font-medium">
                  {selectedAppointment.patientName}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">
                  Trạng thái hiện tại
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    selectedAppointment.state
                  )}`}
                >
                  {getStatusLabel(selectedAppointment.state)}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-3">
                  Chọn trạng thái mới
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      "CREATED",
                      "SHOWED",
                      "CANCELED",
                      "NO_SHOWED",
                    ] as AppointmentState[]
                  ).map((state) => (
                    <button
                      key={state}
                      onClick={() =>
                        handleUpdateState(selectedAppointment.id, state)
                      }
                      disabled={updateAppointmentState.isPending}
                      className={`px-4 py-3 rounded-lg border transition-colors ${getStatusColor(
                        state
                      )} hover:opacity-80 disabled:opacity-50`}
                    >
                      {getStatusLabel(state)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">Chi tiết lịch hẹn</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedAppointment(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {appointment.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
              ) : appointment.data ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Mã lịch hẹn</p>
                      <p className="text-white font-medium font-mono">
                        {appointment.data.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Trạng thái</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          appointment.data.state
                        )}`}
                      >
                        {getStatusLabel(appointment.data.state)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Thông tin bệnh nhân
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Họ tên</p>
                        <p className="text-white">
                          {appointment.data.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Patient ID</p>
                        <p className="text-white">
                          {appointment.data.patientId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Ngày hẹn</p>
                        <p className="text-white">{appointment.data.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Ca khám</p>
                        <p className="text-white">
                          {appointment.data.shift === 0 ? "Sáng" : "Chiều"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Thông tin khám
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Gói khám</p>
                        <p className="text-white">
                          {appointment.data.medicalPackageName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">
                          Medical Package ID
                        </p>
                        <p className="text-white font-mono">
                          {appointment.data.medicalPackageId}
                        </p>
                      </div>
                      {appointment.data.services &&
                        appointment.data.services.length > 0 && (
                          <div className="col-span-2">
                            <p className="text-sm text-slate-400 mb-2">
                              Dịch vụ
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {appointment.data.services.map((service) => (
                                <span
                                  key={service.id}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm"
                                >
                                  {service.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                  <p className="text-slate-400">
                    Không thể tải thông tin chi tiết
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
