import { useState, useEffect } from "react";
import { getInventory, getOrders } from "./api/inventoryApi";

import Dashboard from "./components/Dashboard";
import AlertBanner from "./components/AlertBanner";
import InventoryTable from "./components/InventoryTable";
import OrderHistory from "./components/OrderHistory";
import StockLevels from "./components/StockLevels";

import { isPeakHour } from "./utils/statusHelper";
import { motion } from "framer-motion";

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const peak = isPeakHour();

  const fetchData = async () => {
    try {
      const [inv, ord] = await Promise.all([
        getInventory(),
        getOrders()
      ]);
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
    <div className="min-h-screen bg-slate-100">
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          relative overflow-hidden
          bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700
          px-8 py-8
        "
      >
        {/* glow */}
        <div className="absolute inset-0 bg-white/10 blur-3xl" />

        <div className="relative flex flex-col items-center text-center gap-2">
          {/* GRADIENT HEADING */}
          <h1
            className="
              text-4xl md:text-5xl font-extrabold tracking-tight
              bg-gradient-to-r from-cyan-300 via-white to-pink-300
              bg-clip-text text-transparent
            "
          >
            ✈️ Airport Lounge Inventory
          </h1>

          <p className="text-indigo-200 text-sm tracking-wide">
            Automated Replenishment Agent
          </p>

          {/* Peak badge */}
          {peak && (
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="
                mt-3
                bg-red-500/90
                text-white text-xs font-bold
                px-4 py-2 rounded-full
                shadow-lg
                backdrop-blur-xl
              "
            >
              ⚡ PEAK HOURS ACTIVE
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ALERT BANNER */}
      <AlertBanner inventory={inventory} />

      {/* TABS */}
      <div className="bg-white border-b px-6 flex gap-4 shadow-sm justify-center">
        {["dashboard", "stock", "inventory", "orders"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 font-medium border-b-2 transition-all ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "dashboard"
              ? "📊 Dashboard"
              : tab === "stock"
              ? "📦 Stock Levels"
              : tab === "inventory"
              ? "🧾 Inventory"
              : "📋 Orders"}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {activeTab === "dashboard" && (
          <Dashboard inventory={inventory} orders={orders} />
        )}

        {activeTab === "stock" && (
          <StockLevels inventory={inventory} onFulfill={fetchData}/>
        )}

        {activeTab === "inventory" && (
          <InventoryTable inventory={inventory} refresh={fetchData} />
        )}

        {activeTab === "orders" && (
          <OrderHistory orders={orders} refresh={fetchData} />
        )}
      </div>
    </div>
  );
}