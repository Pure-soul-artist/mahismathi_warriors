import { motion } from "framer-motion";

export default function Dashboard({ inventory = [], orders = [] }) {
  const low = inventory.filter(i => i.status === "low").length;
  const critical = inventory.filter(i => i.status === "critical").length;

  const today = new Date().toDateString();
  const ordersToday = orders.filter(
    o => new Date(o.triggered_at).toDateString() === today
  ).length;

  const kpis = [
    {
      label: "Total Items",
      value: inventory.length,
      bg: "bg-gradient-to-br from-sky-100 to-sky-200",
      text: "text-sky-900"
    },
    {
      label: "Low Stock",
      value: low,
      bg: "bg-gradient-to-br from-amber-100 to-amber-200",
      text: "text-amber-900"
    },
    {
      label: "Critical",
      value: critical,
      bg: "bg-gradient-to-br from-rose-100 to-rose-200",
      text: "text-rose-900"
    },
    {
      label: "Orders Today",
      value: ordersToday,
      bg: "bg-gradient-to-br from-emerald-100 to-emerald-200",
      text: "text-emerald-900"
    }
  ];

  const insights = [
    {
      label: "Healthy Items",
      value: inventory.length - low - critical,
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      text: "text-emerald-900"
    },
    {
      label: "Reorder Required",
      value: low + critical,
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      text: "text-amber-900"
    },
    {
      label: "Total Orders",
      value: orders.length,
      bg: "bg-gradient-to-br from-sky-50 to-sky-100",
      text: "text-sky-900"
    }
  ];

  return (
    <div className="relative rounded-3xl p-10 space-y-20 overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0')"
        }}
      />

      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/20" />

      {/* CONTENT */}
      <div className="relative z-10 space-y-20">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Real-time inventory health & activity
            </p>
          </div>

          <div className="px-4 py-2 rounded-lg bg-white/90 shadow text-sm text-slate-700">
            {today}
          </div>
        </div>

        {/* KPI SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className={`
                ${item.bg}
                rounded-2xl
                px-6 py-5
                shadow-md
                hover:scale-[1.02]
                transition
              `}
            >
              <p className="text-xs uppercase tracking-wide text-slate-700">
                {item.label}
              </p>
              <p className={`mt-2 text-3xl font-bold ${item.text}`}>
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* OPERATIONAL INSIGHTS */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">
            Operational Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`
                  ${item.bg}
                  rounded-2xl
                  px-6 py-6
                  shadow-sm
                  hover:shadow-md
                  transition
                `}
              >
                <p className="text-xs uppercase tracking-wide text-slate-700">
                  {item.label}
                </p>
                <p className={`mt-3 text-3xl font-semibold ${item.text}`}>
                  {item.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}