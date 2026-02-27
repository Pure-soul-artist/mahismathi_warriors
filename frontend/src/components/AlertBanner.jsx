export default function AlertBanner({ inventory }) {
  const alerts = inventory.filter(i => i.status === "low" || i.status === "critical");
  if (alerts.length === 0) return null;

  return (
    <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center gap-2 overflow-hidden">
      <span className="font-bold text-red-700 whitespace-nowrap">⚠️ LOW STOCK:</span>
      <div className="flex gap-3 overflow-x-auto">
        {alerts.map(item => (
          <span key={item.id} className={`whitespace-nowrap px-2 py-1 rounded text-xs font-medium ${
            item.status === "critical" ? "bg-red-200 text-red-800" : "bg-orange-100 text-orange-800"
          }`}>
            {item.name} ({item.current_stock} {item.unit})
          </span>
        ))}
      </div>
    </div>
  );
}
