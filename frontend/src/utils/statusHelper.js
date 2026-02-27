export const getStatusBadge = (status) => ({
  ok: { label: "OK", className: "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold" },
  low: { label: "Low", className: "bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold" },
  critical: { label: "Critical", className: "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold" },
}[status] || { label: "Unknown", className: "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-bold" });

export const isPeakHour = () => {
  const h = new Date().getHours();
  return (h >= 6 && h < 9) || (h >= 11 && h < 14) || (h >= 17 && h < 21);
};

export const getEffectiveThreshold = (base) => isPeakHour() ? Math.floor(base * 1.5) : base;
