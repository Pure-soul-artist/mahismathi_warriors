import { motion } from "framer-motion";
import { fulfillOrder } from "../api/inventoryApi";

export default function OrderHistory({ orders = [], refresh }) {

  const handleFulfill = async (id) => {
    await fulfillOrder(id);
    refresh();
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-100 via-white to-slate-200 font-['Inter']">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h1
          className="
            text-4xl font-extrabold tracking-tight
            bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-rose-500
            bg-clip-text text-transparent
          "
        >
          Order Intelligence
        </h1>
        <p className="mt-2 text-slate-500">
          Automated & manual replenishment history
        </p>
      </motion.div>

      {/* TABLE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          bg-white/80 backdrop-blur-xl
          rounded-3xl overflow-hidden
          shadow-[0_30px_70px_rgba(0,0,0,0.15)]
        "
      >
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              {["Item", "Qty", "Triggered By", "Peak", "Email", "Status", "Time", "Action"].map(h => (
                <th key={h} className="px-4 py-4 text-left">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map(order => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
              >
                <td className="px-4 py-4 font-medium">{order.item_name}</td>
                <td className="px-4 py-4">{order.quantity_ordered}</td>

                <td className="px-4 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.triggered_by === "auto"
                        ? "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800"
                        : "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800"
                    }`}
                  >
                    {order.triggered_by}
                  </span>
                </td>

                <td className="px-4 py-4">
                  {order.is_peak_hour ? "⚡ Yes" : "—"}
                </td>

                <td className="px-4 py-4">
                  {order.email_sent ? "✅" : "❌"}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === "pending"
                        ? "bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-800"
                        : "bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-4 py-4 text-xs text-slate-400">
                  {new Date(order.triggered_at).toLocaleString()}
                </td>

                <td className="px-4 py-4">
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleFulfill(order.id)}
                      className="
                        bg-gradient-to-r from-emerald-500 to-teal-500
                        text-white px-4 py-1.5
                        rounded-full text-xs font-medium
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

        {orders.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No orders yet
          </div>
        )}
      </motion.div>
    </div>
  );
}