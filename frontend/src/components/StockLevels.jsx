import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { motion } from "framer-motion";

export default function StockLevels({ inventory = [] }) {

  const chartData = inventory.map(item => ({
    name: item.name,
    stock: item.current_stock,
    status: item.status
  }));

  const getColor = (status) => {
    switch (status) {
      case "ok":
        return "url(#okGradient)";
      case "low":
        return "url(#lowGradient)";
      case "critical":
        return "url(#criticalGradient)";
      default:
        return "#94a3b8";
    }
  };

  return (
    <div
      className="min-h-screen p-10 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/2767767/pexels-photo-2767767.jpeg')"
      }}
    >
      {/* SOFT OVERLAY FOR READABILITY */}
      <div className="absolute inset-0 bg-white/70" />

      <div className="relative z-10 font-['Inter']">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h1
            className="
              text-4xl md:text-5xl font-extrabold tracking-tight
              text-slate-900
            "
          >
            Stock Intelligence Dashboard
          </h1>
          <p className="mt-3 text-slate-600 tracking-wide">
            Real-time inventory health with predictive insights
          </p>
        </motion.div>

        {/* CHART CARD */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="
            bg-white
            rounded-3xl p-8
            shadow-[0_30px_70px_rgba(0,0,0,0.18)]
          "
        >
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} layout="vertical">
              <defs>
                {/* OK gradient */}
                <linearGradient id="okGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#4ade80" />
                </linearGradient>

                {/* LOW gradient */}
                <linearGradient id="lowGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>

                {/* CRITICAL gradient */}
                <linearGradient id="criticalGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>

              <XAxis
                type="number"
                tick={{ fill: "#475569", fontSize: 12 }}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fill: "#334155", fontSize: 13 }}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                }}
              />

              <Bar
                dataKey="stock"
                radius={[0, 10, 10, 0]}
                isAnimationActive
                animationDuration={1200}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={getColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* LEGEND */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-10 mt-8 text-sm"
        >
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-green-300" />
            Optimal
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400" />
            Low
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-red-600" />
            Critical
          </div>
        </motion.div>
      </div>
    </div>
  );
}