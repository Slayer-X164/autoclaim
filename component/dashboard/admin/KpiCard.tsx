import Image from "next/image";

interface KpiCardProps {
  title: string;
  value: string | number;
  iconSrc: string;
  borderColor: string;
  iconBgColor: string;
}

export default function KpiCard({ title, value, iconSrc, borderColor, iconBgColor }: KpiCardProps) {
  return (
    <div 
      className="flex-1 h-[140px] flex flex-col justify-between p-6 bg-white border rounded-xl"
      style={{ borderColor }}
    >
      <div className="flex items-center justify-between">
        <span className="font-instrument font-semibold text-[14px] text-[#475569]">{title}</span>
        <div 
          className="w-8 h-8 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <Image src={iconSrc} alt={title} width={16} height={16} />
        </div>
      </div>
      <span className="font-sans font-bold text-[40px] text-[#0F172A]">{value}</span>
    </div>
  );
}
