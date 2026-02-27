import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

export default function Dashboard({ inventory, orders }) {
  const low = inventory.filter(i => i.status === "low").length;
  const critical = inventory.filter(i => i.status === "critical").length;
  const today = new Date().toDateString();
  const ordersToday = orders.filter(o => new Date(o.triggered_at).toDateString() === today).length;

  const cards = [
    { label: "Total Items", value: inventory.length, color: "bg-blue-500" },
    { label: "Low Stock", value: low, color: "bg-orange-500" },
    { label: "Critical", value: critical, color: "bg-red-500" },
    { label: "Orders Today", value: ordersToday, color: "bg-green-500" },
  ];

  const chartData = inventory.slice(0, 12).map(i => ({
    name: i.name.split(" ")[0],
    stock: i.current_stock,
    threshold: i.base_threshold,
    status: i.status,
  }));

  const getColor = (status) => ({ ok: "#22c55e", low: "#f97316", critical: "#ef4444" }[status] || "#94a3b8");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`${c.color} text-white rounded-xl p-4 shadow`}>
            <p className="text-sm opacity-80">{c.label}</p>
            <p className="text-4xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-gray-700 mb-4">Stock Levels vs Threshold</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="stock" name="Current Stock" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded inline-block"></span>OK</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded inline-block"></span>Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded inline-block"></span>Critical</span>
        </div>
      </div>
    </div>
  );
}
