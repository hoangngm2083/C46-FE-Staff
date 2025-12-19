import { Search, X } from "lucide-react";

interface SearchFilterProps {
  searchKeyword: string;
  selectedRole: number | undefined;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: number | undefined) => void;
  onClearFilters: () => void;
}

export default function SearchFilter({
  searchKeyword,
  selectedRole,
  onSearchChange,
  onRoleChange,
  onClearFilters,
}: SearchFilterProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
      <h2 className="text-xl font-bold mb-4">Tìm kiếm và lọc</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <select
          value={selectedRole ?? ""}
          onChange={(e) =>
            onRoleChange(
              e.target.value === "" ? undefined : Number(e.target.value)
            )
          }
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400 focus:outline-none"
        >
          <option className="text-black" value="">
            Tất cả vai trò
          </option>
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

        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Xóa bộ lọc</span>
        </button>
      </div>
    </div>
  );
}
