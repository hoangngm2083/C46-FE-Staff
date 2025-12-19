import { Edit2, Trash2 } from "lucide-react";

interface MedicalServiceTableProps {
  services: MedicalServiceDTO[];
  onEdit: (service: MedicalServiceDTO) => void;
  onDelete: (service: MedicalServiceDTO) => void;
}

export default function MedicalServiceTable({
  services,
  onEdit,
  onDelete,
}: MedicalServiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4">Tên dịch vụ</th>
            <th className="text-left py-3 px-4">Phòng ban</th>
            <th className="text-left py-3 px-4">Độ ưu tiên</th>
            <th className="text-left py-3 px-4">Mô tả</th>
            <th className="text-right py-3 px-4">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-400">
                Không có dịch vụ nào
              </td>
            </tr>
          ) : (
            services.map((service) => (
              <tr
                key={service.medicalServiceId}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4">{service.name}</td>
                <td className="py-3 px-4">{service.departmentName}</td>
                <td className="py-3 px-4">{service.processingPriority}</td>
                <td className="py-3 px-4">
                  <div className="max-w-md truncate">{service.description}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(service)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => onDelete(service)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
