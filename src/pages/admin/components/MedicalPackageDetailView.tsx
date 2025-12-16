import { ArrowLeft, Plus, X } from "lucide-react";
import { useState } from "react";
import useBookingService from "@/services/bookingService";
import { format, isSameDay } from "date-fns";
import toast from "react-hot-toast";

interface MedicalPackageDetailViewProps {
  packageData: MedicalPackageDetailDTO;
  onBack: () => void;
}

export default function MedicalPackageDetailView({
  packageData,
  onBack,
}: MedicalPackageDetailViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingSlot, setEditingSlot] = useState<ISlot | null>(null);
  const [slotFormData, setSlotFormData] = useState({
    shift: 0 as Shift,
    maxQuantity: 10,
  });

  const { slots, createSlot, updateSlot } = useBookingService({
    medicalPackageId: packageData.medicalPackageId,
    slotsParams: { size: 1000 },
  });

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN");
  };

  const getSlotsForDate = (date: Date) => {
    return (
      slots.data?.content?.filter((slot) => isSameDay(slot.date, date)) || []
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isAfterToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
  };

  const handleDateClick = (date: Date) => {
    if (isAfterToday(date)) {
      setSelectedDate(date);
      setEditingSlot(null);
      setSlotFormData({ shift: 0, maxQuantity: 10 });
      setShowCreateSlotModal(true);
    }
  };

  const handleSlotClick = (e: React.MouseEvent, slot: ISlot) => {
    e.stopPropagation();
    setEditingSlot(slot);
    setSelectedDate(new Date(slot.date));
    setSlotFormData({
      shift: slot.shift,
      maxQuantity: slot.maxQuantity,
    });
    setShowCreateSlotModal(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    try {
      if (editingSlot) {
        await updateSlot.mutateAsync({
          slotId: editingSlot.slotId,
          maxQuantity: slotFormData.maxQuantity,
        });
      } else {
        await createSlot.mutateAsync({
          date: format(selectedDate, "yyyy-MM-dd"),
          shift: slotFormData.shift,
          medicalPackageId: packageData.medicalPackageId,
          maxQuantity: slotFormData.maxQuantity,
        });
      }
      setShowCreateSlotModal(false);
      setSlotFormData({ shift: 0, maxQuantity: 10 });
      setSelectedDate(null);
      setEditingSlot(null);
      slots.refetch();
    } catch (error: any) {
      console.error("Error saving slot:", error);
      toast.error(error.response?.data?.message || "Lỗi khi lưu slot");
    }
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Quay lại danh sách</span>
      </button>

      {/* Package details */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex gap-6">
          {/* Image */}
          {packageData.image && (
            <div className="shrink-0">
              <img
                src={packageData.image}
                alt={packageData.name}
                className="w-64 h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {packageData.name}
              </h2>
              <p className="text-3xl font-bold text-blue-400">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(
                  Number(packageData.price ?? packageData.prices["1"] ?? 0)
                )}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Mô tả</h3>
              <p className="text-gray-300">{packageData.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Dịch vụ bao gồm
              </h3>
              <div className="space-y-2">
                {packageData.medicalServices.map((service) => (
                  <div
                    key={service.medicalServiceId}
                    className="bg-white/5 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white">{service.name}</p>
                        <p className="text-sm text-gray-400">
                          {service.departmentName}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        Ưu tiên: {service.processingPriority}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-400 mt-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar view for slots */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">
          Gói khám đã tạo
        </h3>

        {/* Calendar navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            ←
          </button>
          <h4 className="text-lg font-semibold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            →
          </button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-400 py-2"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            );
            const daySlots = getSlotsForDate(date);
            const hasSlots = daySlots.length > 0;
            const today = isToday(day);
            const canCreate = isAfterToday(date);

            return (
              <div
                key={day}
                onClick={() => handleDateClick(date)}
                className={`aspect-square p-2 rounded-lg border transition-colors ${
                  today
                    ? "border-blue-400 bg-blue-500/20"
                    : "border-white/10 bg-white/5"
                } ${canCreate ? "hover:bg-white/10 cursor-pointer" : ""}`}
              >
                <div className="text-center h-full">
                  <div className={`text-sm ${today ? "font-bold" : ""}`}>
                    {day}
                  </div>
                  {hasSlots ? (
                    <div className="mt-1 flex flex-col gap-2">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.slotId}
                          onClick={(e) => handleSlotClick(e, slot)}
                          className="text-xs bg-green-500/20 text-green-400 rounded px-1 py-0.5 flex-1 hover:bg-green-500/30 cursor-pointer transition-colors"
                        >
                          {slot.shift === 0 ? "Sáng" : "Chiều"} (
                          {slot.remainingQuantity}/{slot.maxQuantity})
                        </div>
                      ))}
                    </div>
                  ) : (
                    canCreate && (
                      <div className="mt-1">
                        <Plus className="w-4 h-4 mx-auto text-gray-400" />
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading state */}
        {slots.isLoading && (
          <div className="text-center py-4 text-gray-400">
            Đang tải lịch khám...
          </div>
        )}

        {/* No slots message */}
        {!slots.isLoading &&
          (!slots.data?.content || slots.data.content.length === 0) && (
            <div className="text-center py-4 text-gray-400">
              Chưa có lịch khám nào được tạo. Click vào ngày sau hôm nay để tạo
              slot.
            </div>
          )}
      </div>

      {/* Create/Edit Slot Modal */}
      {showCreateSlotModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingSlot ? "Cập nhật slot" : "Tạo slot khám"} -{" "}
                {formatDate(selectedDate)}
              </h3>
              <button
                onClick={() => {
                  setShowCreateSlotModal(false);
                  setSelectedDate(null);
                  setEditingSlot(null);
                  setSlotFormData({ shift: 0, maxQuantity: 10 });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              {/* Shift selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ca khám
                </label>
                <select
                  value={slotFormData.shift}
                  onChange={(e) =>
                    setSlotFormData({
                      ...slotFormData,
                      shift: parseInt(e.target.value) as Shift,
                    })
                  }
                  disabled={!!editingSlot}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option className="text-black" value={0}>
                    Sáng
                  </option>
                  <option className="text-black" value={1}>
                    Chiều
                  </option>
                </select>
              </div>

              {/* Max quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số lượng tối đa
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={slotFormData.maxQuantity}
                  onChange={(e) =>
                    setSlotFormData({
                      ...slotFormData,
                      maxQuantity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateSlotModal(false);
                    setSelectedDate(null);
                    setEditingSlot(null);
                    setSlotFormData({ shift: 0, maxQuantity: 10 });
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createSlot.isPending || updateSlot.isPending}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createSlot.isPending || updateSlot.isPending
                    ? "Đang xử lý..."
                    : editingSlot
                    ? "Cập nhật"
                    : "Tạo slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
