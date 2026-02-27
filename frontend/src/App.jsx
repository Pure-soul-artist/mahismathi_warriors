import { useState, useEffect } from "react";
import { getInventory, getOrders } from "./api/inventoryApi";
import Dashboard from "./components/Dashboard";
import AlertBanner from "./components/AlertBanner";
import InventoryTable from "./components/InventoryTable";
import OrderHistory from "./components/OrderHistory";
import { isPeakHour } from "./utils/statusHelper";

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const peak = isPeakHour();

  const fetchData = async () => {
    try {
      const [inv, ord] = await Promise.all([getInventory(), getOrders()]);
      setInventory(inv.data);
      setOrders(ord.data);
    } catch (e) {
      console.error("Fetch error:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">✈️ Airport Lounge Inventory</h1>
          <p className="text-indigo-200 text-sm">Automated Replenishment Agent</p>
        </div>
        {peak && (
          <div className="bg-red-500 px-4 py-2 rounded-lg animate-pulse font-bold text-sm">
            ⚡ PEAK HOURS ACTIVE
          </div>
        )}
      </div>

      {/* Alert Banner */}
      <AlertBanner inventory={inventory} />

      {/* Tabs */}
      <div className="bg-white border-b px-6 flex gap-4">
        {["dashboard", "inventory", "orders"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "dashboard" ? "📊 Dashboard" : tab === "inventory" ? "📦 Inventory" : "📋 Orders"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "dashboard" && <Dashboard inventory={inventory} orders={orders} />}
        {activeTab === "inventory" && <InventoryTable inventory={inventory} refresh={fetchData} />}
        {activeTab === "orders" && <OrderHistory orders={orders} refresh={fetchData} />}
      </div>
    </div>
  );
}
