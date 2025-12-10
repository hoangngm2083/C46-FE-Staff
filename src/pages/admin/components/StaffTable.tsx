import { Users, Edit, Trash2 } from "lucide-react";
import { UseQueryResult } from "@tanstack/react-query";

interface StaffTableProps {
  staffsQuery: UseQueryResult<Pagination<Staff>, Error>;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

export default function StaffTable({
  staffsQuery,
  onEdit,
  onDelete,
}: StaffTableProps) {
  const getRoleName = (role: number) => {
    switch (role) {
      case 0:
        return "Doctor";
      case 1:
        return "Receptionist";
      case 2:
        return "Manager";
      case 3:
        return "Admin";
      default:
        return "Unknown";
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 0:
        return "text-red-400";
      case 1:
        return "text-blue-400";
      case 2:
        return "text-green-400";
      case 3:
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  if (staffsQuery.isLoading || staffsQuery.isRefetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!staffsQuery.data?.content || staffsQuery.data.content.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg">Không tìm thấy nhân viên</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Tên
            </th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Email
            </th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Vai trò
            </th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Điện thoại
            </th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">
              Phòng ban
            </th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {staffsQuery.data.content.map((staff) => (
            <tr
              key={staff.id}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  {staff.image ? (
                    <img
                      src={staff.image}
                      alt={staff.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-cyan-400" />
                    </div>
                  )}
                  <span className="font-medium">{staff.name}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-slate-300">{staff.email}</td>
              <td className="py-4 px-4">
                <span className={`font-medium ${getRoleColor(staff.role)}`}>
                  {getRoleName(staff.role)}
                </span>
              </td>
              <td className="py-4 px-4 text-slate-300">
                {staff.phone || "N/A"}
              </td>
              <td className="py-4 px-4 text-slate-300">
                {staff.departmentName || "N/A"}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(staff)}
                    className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => onDelete(staff)}
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
