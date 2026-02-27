import { fulfillOrder } from "../api/inventoryApi";

export default function OrderHistory({ orders, refresh }) {
  const handleFulfill = async (id) => {
    await fulfillOrder(id);
    refresh();
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            {["Item", "Qty", "Triggered By", "Peak Hour", "Email", "Status", "Time", "Action"].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map(order => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{order.item_name}</td>
              <td className="px-4 py-3">{order.quantity_ordered}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.triggered_by === "auto" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                  {order.triggered_by}
                </span>
              </td>
              <td className="px-4 py-3">{order.is_peak_hour ? "⚡ Yes" : "—"}</td>
              <td className="px-4 py-3">{order.email_sent ? "✅" : "❌"}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.triggered_at).toLocaleString()}</td>
              <td className="px-4 py-3">
                {order.status === "pending" && (
                  <button onClick={() => handleFulfill(order.id)}
                    className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium hover:bg-green-200">
                    Fulfill
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="text-center py-8 text-gray-400">No orders yet</p>}
    </div>
  );
}
