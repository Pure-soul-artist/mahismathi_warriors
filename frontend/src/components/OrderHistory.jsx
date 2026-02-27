import { motion } from "framer-motion";
import { fulfillOrder } from "../api/inventoryApi";

export default function OrderHistory({ orders = [], refresh }) {

  const handleFulfill = async (id) => {
    await fulfillOrder(id);
    refresh();
  };

  return (
    /* 🌑 DARK TRANSPARENT PAGE */
    <div className="p-8 font-['Inter']">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-extrabold text-slate-900">
          Order Intelligence
        </h1>
        <p className="mt-2 text-slate-700 font-medium">
          Automated & manual replenishment history
        </p>
      </motion.div>

      {/* TABLE CARD – DARK GLASS */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          bg-black/40 backdrop-blur-2xl
          border border-white/20
          rounded-3xl overflow-hidden
          shadow-[0_40px_120px_rgba(0,0,0,0.85)]
        "
      >
        <table className="w-full text-sm">
          {/* TABLE HEADER */}
          <thead className="sticky top-0 bg-black/60 text-white uppercase text-xs">
            <tr>
              {["Item", "Qty", "Triggered By", "Peak", "Email", "Status", "Time", "Action"].map(h => (
                <th key={h} className="px-4 py-4 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-white/10">
            {orders.map(order => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                className={
                  order.status === "pending"
                    ? "bg-amber-500/10"
                    : "bg-emerald-500/10"
                }
              >
                <td className="px-4 py-4 font-semibold text-white">
                  {order.item_name}
                </td>

                <td className="px-4 py-4 text-white/80">
                  {order.quantity_ordered}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.triggered_by === "auto"
                        ? "bg-indigo-500/20 text-indigo-200"
                        : "bg-purple-500/20 text-purple-200"
                    }`}
                  >
                    {order.triggered_by}
                  </span>
                </td>

                <td className="px-4 py-4 text-white/80">
                  {order.is_peak_hour ? "⚡ Yes" : "—"}
                </td>

                <td className="px-4 py-4 text-white/80">
                  {order.email_sent ? "✅" : "❌"}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "pending"
                        ? "bg-amber-500/20 text-amber-200"
                        : "bg-emerald-500/20 text-emerald-200"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-4 py-4 text-xs text-white/50">
                  {new Date(order.triggered_at).toLocaleString()}
                </td>

                <td className="px-4 py-4">
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleFulfill(order.id)}
                      className="
                        bg-emerald-600/90
                        text-white px-4 py-1.5
                        rounded-full text-xs font-semibold
                        shadow-md hover:shadow-lg
                        transition
                      "
                    >
                      Fulfill
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* EMPTY STATE */}
        {orders.length === 0 && (
          <div className="text-center py-14 text-white/60 font-medium">
            No orders yet
          </div>
        )}
      </motion.div>
    </div>
  );
}