import type { IconType } from "react-icons";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  tint: string;
}

export default function KpiCard({ title, value, icon: Icon, tint }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}
        >
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-[#0F172A]">{value}</p>
    </div>
  );
}