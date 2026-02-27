import { motion } from "framer-motion";

export default function AlertBanner({ inventory = [] }) {

  const alerts = inventory.filter(
    item => item.status === "low" || item.status === "critical"
  );

  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        relative overflow-hidden
        bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400
        px-6 py-4
      "
    >
      {/* glow */}
      <div className="absolute inset-0 bg-white/10 blur-2xl" />

      <div className="relative flex items-center gap-4">
        {/* animated warning emoji (NO external lib) */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="
            flex items-center justify-center
            w-10 h-10 rounded-full
            bg-white/20 text-xl
          "
        >
          ⚠️
        </motion.div>

        {/* title */}
        <span className="text-white font-bold tracking-wider whitespace-nowrap">
          LOW STOCK ALERT
        </span>

        {/* scrolling items */}
        <div className="relative flex-1 overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              repeat: Infinity,
              duration: 30,
              ease: "linear"
            }}
            className="flex gap-4 w-max"
          >
            {[...alerts, ...alerts].map((item, index) => (
              <div
                key={index}
                className="
                  flex items-center gap-2
                  bg-white/90 text-gray-900
                  px-4 py-2 rounded-full
                  text-sm font-medium
                  shadow-lg
                  backdrop-blur-xl
                "
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.status === "critical"
                      ? "bg-red-600"
                      : "bg-orange-500"
                  }`}
                />
                {item.name}
                <span className="text-xs text-gray-500">
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