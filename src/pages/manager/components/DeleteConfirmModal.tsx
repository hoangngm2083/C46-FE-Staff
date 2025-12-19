import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  staffName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  staffName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold">Xác nhận xóa</h2>
        </div>

        <p className="text-slate-300 mb-6">
          Bạn có chắc chắn muốn xóa nhân viên{" "}
          <span className="font-semibold text-white">{staffName}</span>? Hành
          động này không thể hoàn tác.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
