import useStaffService from "@/services/staffService";
import { useFileService } from "@/services/fileService";
import { X, Save, Upload } from "lucide-react";

interface StaffFormModalProps {
  isOpen: boolean;
  title: string;
  formData: CreateStaffRequest | UpdateStaffRequest;
  isSubmitting: boolean;
  showEmailField?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<CreateStaffRequest | UpdateStaffRequest>) => void;
}

export default function StaffFormModal({
  isOpen,
  title,
  formData,
  isSubmitting,
  showEmailField = true,
  onClose,
  onSubmit,
  onChange,
}: StaffFormModalProps) {
  const { departments } = useStaffService({
    departmentsParams: { size: 1000 },
  });
  const { uploadFile: uploadAvatar } = useFileService();
  const { uploadFile: uploadSignature } = useFileService();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tên <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {showEmailField && "email" in formData && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => onChange({ email: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          )}

          {showEmailField && "accountName" in formData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên tài khoản <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={50}
                  value={formData.accountName}
                  onChange={(e) => onChange({ accountName: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Tối thiểu 3 ký tự"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mật khẩu <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => onChange({ password: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Vai trò <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => onChange({ role: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option className="text-black" value={3}>
                  Admin
                </option>
                <option className="text-black" value={2}>
                  Manager
                </option>
                <option className="text-black" value={0}>
                  Doctor
                </option>
                <option className="text-black" value={1}>
                  Receptionist
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Điện thoại
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phòng ban{" "}
              {!showEmailField && <span className="text-red-400">*</span>}
            </label>
            <select
              required={!showEmailField}
              value={formData.departmentId}
              onChange={(e) => onChange({ departmentId: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option className="text-black" value="">
                -- Chọn phòng ban --
              </option>
              {departments.data?.content.map((dept) => (
                <option key={dept.id} className="text-black" value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Avatar</label>
            <div className="flex items-center space-x-4">
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover border border-white/10"
                />
              )}
              <div className="flex-1">
                <label
                  className={`flex items-center justify-center w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${
                    uploadAvatar.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  <span>
                    {uploadAvatar.isPending ? "Đang tải lên..." : "Chọn ảnh"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadAvatar.mutate(file, {
                          onSuccess: (data) => {
                            onChange({ image: data.url });
                          },
                        });
                      }
                    }}
                    disabled={uploadAvatar.isPending}
                  />
                </label>
              </div>
            </div>
          </div>

          {formData.role !== 1 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Chữ ký điện tử
              </label>
              <div className="flex items-center space-x-4">
                {formData.eSignature && (
                  <img
                    src={formData.eSignature}
                    alt="Signature preview"
                    className="h-16 aspect-square object-contain bg-white/10 rounded-lg p-2 border border-white/10"
                  />
                )}
                <div className="flex-1">
                  <label
                    className={`flex items-center justify-center w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${
                      uploadSignature.isPending
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    <span>
                      {uploadSignature.isPending
                        ? "Đang tải lên..."
                        : "Chọn chữ ký"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          uploadSignature.mutate(file, {
                            onSuccess: (data) => {
                              onChange({ eSignature: data.url });
                            },
                          });
                        }
                      }}
                      disabled={uploadSignature.isPending}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? showEmailField
                    ? "Đang tạo..."
                    : "Đang cập nhật..."
                  : showEmailField
                  ? "Tạo nhân viên"
                  : "Cập nhật"}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
