import { motion } from "framer-motion";

export default function AlertBanner({ inventory = [] }) {
  const alerts = inventory.filter(
    item => item.status === "low" || item.status === "critical"
  );

  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden px-6 py-4 rounded-xl"
    >
      {/* DARK ANIMATED GRADIENT */}
      <motion.div
        className="
          absolute inset-0
          bg-gradient-to-r
          from-[#0f172a] via-[#020617] to-[#0f172a]
          bg-[length:200%_200%]
        "
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* glass overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />

      <div className="relative flex items-center gap-4">
        {/* icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="
            flex items-center justify-center
            w-10 h-10 rounded-full
            bg-gradient-to-br from-cyan-400 to-emerald-400
            text-slate-900 text-lg
            shadow-[0_0_20px_rgba(34,211,238,0.5)]
          "
        >
          ⚠️
        </motion.div>

        {/* title */}
        <span className="font-semibold tracking-wide text-slate-200 whitespace-nowrap">
          LOW STOCK ALERT
        </span>

        {/* scrolling items */}
        <div className="relative flex-1 overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 28,
              ease: "linear"
            }}
            className="flex gap-4 w-max"
          >
            {[...alerts, ...alerts].map((item, index) => (
              <div
                key={index}
                className="
                  flex items-center gap-2
                  bg-white/10
                  text-slate-100
                  px-4 py-2 rounded-full
                  text-sm font-medium
                  border border-white/10
                  backdrop-blur-lg
                "
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.status === "critical"
                      ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                      : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  }`}
                />
                {item.name}
                <span className="text-xs text-slate-400">
                  ({item.current_stock} {item.unit})
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}