import { Edit2, Trash2, ArrowRight, Package } from "lucide-react";
import { UseQueryResult } from "@tanstack/react-query";

interface MedicalPackageTableProps {
  packagesQuery: UseQueryResult<Pagination<IMedicalPackage>, Error>;
  onEdit: (pkg: IMedicalPackage) => void;
  onDelete: (pkg: IMedicalPackage) => void;
  onViewDetail: (pkg: IMedicalPackage) => void;
}

export default function MedicalPackageTable({
  packagesQuery,
  onEdit,
  onDelete,
  onViewDetail,
}: MedicalPackageTableProps) {
  if (packagesQuery.isLoading || packagesQuery.isRefetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!packagesQuery.data?.content || packagesQuery.data.content.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg">Không tìm thấy gói khám</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Ảnh
            </th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Tên gói
            </th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Mô tả
            </th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Giá
            </th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {packagesQuery.data.content.map((pkg) => (
            <tr
              key={pkg.medicalPackageId}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                  {pkg.image ? (
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="font-medium">{pkg.name}</span>
              </td>
              <td className="py-4 px-4 text-slate-300">
                <div className="max-w-md truncate">{pkg.description}</div>
              </td>
              <td className="py-4 px-4 text-slate-300">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(pkg.price)}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onViewDetail(pkg)}
                    className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors"
                    title="Xem chi tiết"
                  >
                    <ArrowRight className="w-4 h-4 text-green-400" />
                  </button>
                  <button
                    onClick={() => onEdit(pkg)}
                    className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => onDelete(pkg)}
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
  );
}
