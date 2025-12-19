import { X, Save, Upload } from "lucide-react";
import { useFileService } from "@/services/fileService";

interface MedicalPackageFormModalProps {
  isOpen: boolean;
  title: string;
  formData: CreateMedicalPackageRequest;
  isSubmitting: boolean;
  services: MedicalServiceDTO[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<CreateMedicalPackageRequest>) => void;
}

export default function MedicalPackageFormModal({
  isOpen,
  title,
  formData,
  isSubmitting,
  services,
  onClose,
  onSubmit,
  onChange,
}: MedicalPackageFormModalProps) {
  const { uploadFile } = useFileService();
  if (!isOpen) return null;

  const handleServiceToggle = (serviceId: string) => {
    const currentIds = formData.serviceIds || [];
    const newIds = currentIds.includes(serviceId)
      ? currentIds.filter((id) => id !== serviceId)
      : [...currentIds, serviceId];
    onChange({ serviceIds: newIds });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tên gói khám <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Mô tả <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Giá <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              value={formData.price ?? ""}
              onChange={(e) =>
                onChange({
                  price: !!e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Ảnh gói khám
            </label>
            <div className="flex items-center space-x-4">
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Package preview"
                  className="w-16 h-16 rounded-lg object-cover border border-white/10"
                />
              )}
              <div className="flex-1">
                <label
                  className={`flex items-center justify-center w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${
                    uploadFile.isPending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  <span>
                    {uploadFile.isPending ? "Đang tải lên..." : "Chọn ảnh"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadFile.mutate(file, {
                          onSuccess: (data) => {
                            onChange({ image: data.url });
                          },
                        });
                      }
                    }}
                    disabled={uploadFile.isPending}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Chọn dịch vụ <span className="text-red-400">*</span>
            </label>
            <div className="max-h-48 overflow-y-auto border border-white/10 rounded-lg p-3 bg-white/5">
              {services.length === 0 ? (
                <p className="text-gray-400 text-sm">Không có dịch vụ nào</p>
              ) : (
                services.map((service) => (
                  <label
                    key={service.medicalServiceId}
                    className="flex items-center space-x-2 py-2 hover:bg-white/5 px-2 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.serviceIds?.includes(
                        service.medicalServiceId
                      )}
                      onChange={() =>
                        handleServiceToggle(service.medicalServiceId)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      {service.name} - {service.departmentName}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? "Đang lưu..." : "Lưu"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-white/10 rounded-lg font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
