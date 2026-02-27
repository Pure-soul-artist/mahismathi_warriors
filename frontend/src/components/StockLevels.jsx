import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

export default function StockLevels({ inventory = [], onFulfill }) {

  const chartData = inventory.map(item => ({
    name: item.name,
    stock: item.current_stock,
    status: item.status
  }));

  const getColor = (status) =>
    ({ ok: "#22c55e", low: "#f97316", critical: "#ef4444" }[status] || "#94a3b8");

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">📦 Stock Level View</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={150} />
          <Tooltip />
          <Bar dataKey="stock" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-6 mt-4 text-sm text-gray-600">
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> OK</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded-full"></span> Low</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Critical</span>
      </div>
    </div>
  );
}