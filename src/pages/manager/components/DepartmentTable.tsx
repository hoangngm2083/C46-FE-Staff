import { Edit, Trash2, Building2 } from "lucide-react";
import { UseQueryResult } from "@tanstack/react-query";

interface DepartmentTableProps {
  departmentsQuery: UseQueryResult<Pagination<Department>, Error>;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

export default function DepartmentTable({
  departmentsQuery,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
  if (departmentsQuery.isLoading || departmentsQuery.isRefetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (
    !departmentsQuery.data?.content ||
    departmentsQuery.data.content.length === 0
  ) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg">Không tìm thấy phòng ban</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Tên phòng ban
            </th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Mô tả
            </th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {departmentsQuery.data.content.map((department) => (
            <tr
              key={department.id}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="font-medium">{department.name}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-slate-300">
                {department.description || "N/A"}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(department)}
                    className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => onDelete(department)}
                    className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete"
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
