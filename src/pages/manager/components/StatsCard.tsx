import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  value: number;
  subtitle: string;
  onClick?: () => void;
}

export default function StatsCard({
  icon: Icon,
  iconColor,
  title,
  value,
  subtitle,
  onClick,
}: StatsCardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl ${
        onClick ? "hover:bg-white/10 transition-colors cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className={`text-3xl font-bold ${iconColor}`}>{value}</p>
      <p className="text-sm text-slate-400 mt-2">{subtitle}</p>
      {onClick && <p className="text-xs text-cyan-400 mt-2">Nhấn để tạo tài khoản nhân viên mới →</p>}
    </Component>
  );
}
