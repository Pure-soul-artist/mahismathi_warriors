import { motion } from "framer-motion";

export default function Dashboard({ inventory = [], orders = [] }) {
  const low = inventory.filter(i => i.status === "low").length;
  const critical = inventory.filter(i => i.status === "critical").length;

  const today = new Date().toDateString();
  const ordersToday = orders.filter(
    o => new Date(o.triggered_at).toDateString() === today
  ).length;

  const glass =
    "backdrop-blur-xl bg-white/25 border border-white/30";

  const shadow =
    "shadow-[0_30px_80px_rgba(0,0,0,0.9)] hover:shadow-[0_45px_120px_rgba(0,0,0,1)]";

  return (
    <div className="max-w-7xl mx-auto rounded-3xl p-10 space-y-20">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-white">
            Dashboard Overview
          </h1>
          <p className="text-white/80 font-semibold">
            Real-time inventory health & activity
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-white/90 text-slate-900 font-bold shadow-lg">
          {today}
        </div>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Total Items", value: inventory.length },
          { label: "Low Stock", value: low },
          { label: "Critical", value: critical },
          { label: "Orders Today", value: ordersToday }
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`${glass} ${shadow} rounded-3xl px-8 py-7 hover:scale-105 transition`}
          >
            <p className="text-xs uppercase tracking-widest font-extrabold text-slate-800">
              {item.label}
            </p>
            <p className="mt-3 text-5xl font-extrabold text-slate-900">
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* OPERATIONAL INSIGHTS */}
      <div>
        <h2 className="text-2xl font-extrabold text-white mb-8">
          Operational Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Healthy Items", value: inventory.length - low - critical },
            { label: "Reorder Required", value: low + critical },
            { label: "Total Orders", value: orders.length }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${glass} ${shadow} rounded-3xl px-8 py-8 hover:scale-105 transition`}
            >
              <p className="text-xs uppercase tracking-widest font-extrabold text-slate-800">
                {item.label}
              </p>
              <p className="mt-4 text-4xl font-extrabold text-slate-900">
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}