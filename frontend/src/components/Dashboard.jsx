import { motion } from "framer-motion";

export default function Dashboard({ inventory = [], orders = [] }) {
  const low = inventory.filter(i => i.status === "low").length;
  const critical = inventory.filter(i => i.status === "critical").length;

  const today = new Date().toDateString();
  const ordersToday = orders.filter(
    o => new Date(o.triggered_at).toDateString() === today
  ).length;

  const stats = [
    {
      label: "Total Items",
      value: inventory.length,
      bg: "bg-blue-100",
      text: "text-blue-900"
    },
    {
      label: "Low Stock",
      value: low,
      bg: "bg-yellow-100",
      text: "text-yellow-900"
    },
    {
      label: "Critical",
      value: critical,
      bg: "bg-red-100",
      text: "text-red-900"
    },
    {
      label: "Orders Today",
      value: ordersToday,
      bg: "bg-green-100",
      text: "text-green-900"
    }
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center px-8 py-6"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1628964178609-aec11c666040?q=80&w=1171&auto=format&fit=crop')"
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div className="bg-white/90 px-6 py-4 rounded-xl shadow">
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            ✈ Airport Lounge Inventory
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Automated Replenishment • Live Status
          </p>
        </div>

        <div className="bg-white/90 px-4 py-2 rounded-lg text-sm text-slate-600 shadow">
          {today}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`
              ${item.bg}
              rounded-xl
              px-5 py-4
              shadow-md
            `}
          >
            <p className="text-xs uppercase tracking-wide text-slate-600">
              {item.label}
            </p>
            <p className={`mt-2 text-3xl font-semibold ${item.text}`}>
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* INSIGHTS */}
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-5xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">
          Operational Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-100 rounded-lg p-4">
            <p className="text-xs text-slate-500">Healthy Items</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">
              {inventory.length - low - critical}
            </p>
          </div>

          <div className="bg-slate-100 rounded-lg p-4">
            <p className="text-xs text-slate-500">Reorder Required</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">
              {low + critical}
            </p>
          </div>

          <div className="bg-slate-100 rounded-lg p-4">
            <p className="text-xs text-slate-500">Total Orders</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">
              {orders.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}