import { useState, useEffect } from "react";
import { getInventory, getOrders } from "./api/inventoryApi";

import Dashboard from "./components/Dashboard";
import AlertBanner from "./components/AlertBanner";
import InventoryTable from "./components/InventoryTable";
import OrderHistory from "./components/OrderHistory";
import StockLevels from "./components/StockLevels";
import ChatBot from "./components/ChatBot";

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
    /* ===== GLOBAL BACKGROUND (FULL WEBSITE) ===== */
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1529074963764-98f45c47344b?q=80&w=2086&auto=format&fit=crop')"
      }}
    >
      {/* GLOBAL OVERLAY (READABILITY) */}
      <div className="fixed inset-0 bg-black/15 backdrop-blur-sm -z-10" />

      {/* CONTENT LAYER */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="
            relative overflow-hidden
            bg-gradient-to-r from-sky-200/80 via-sky-300/80 to-cyan-300/80
            px-8 py-10
          "
        >
          {/* soft glow */}
          <div className="absolute inset-0 bg-white/40 blur-3xl" />

          <div className="relative flex flex-col items-center text-center gap-2">
            <h1
              className="
                text-4xl md:text-5xl font-extrabold tracking-tight
                bg-gradient-to-r from-sky-700 via-indigo-700 to-purple-700
                bg-clip-text text-transparent
              "
            >
              ✈️ Airport Lounge Inventory
            </h1>

            <p className="text-slate-700 text-sm tracking-wide">
              Automated Replenishment Agent
            </p>

            {peak && (
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="
                  mt-4
                  bg-red-500/90
                  text-white text-xs font-bold
                  px-5 py-2 rounded-full
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
        <div
          className="
    sticky top-0 z-20
    px-6
    flex gap-6 justify-center
    backdrop-blur-xl
    bg-white/20
    border-b border-white/30
    shadow-[0_20px_50px_rgba(0,0,0,0.25)]
  "
        ></div>
        <div
          className="
    sticky top-0 z-20
    px-6
    flex gap-6 justify-center
    backdrop-blur-xl
    bg-white/20
    border-b border-white/30
    shadow-[0_20px_50px_rgba(0,0,0,0.25)]
  "
        >
          {["dashboard", "stock", "inventory", "orders"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
        py-4 px-5
        font-bold
        tracking-wide
        transition-all duration-300
        ${activeTab === tab
                  ? "text-sky-700 border-b-2 border-sky-600"
                  : "text-slate-700 hover:text-slate-900"
                }
      `}
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
        {/* PAGE CONTENT */}
        <div className="p-6 flex-1">
          {activeTab === "dashboard" && (
            <Dashboard inventory={inventory} orders={orders} />
          )}

          {activeTab === "stock" && (
            <StockLevels inventory={inventory} />
          )}

          {activeTab === "inventory" && (
            <InventoryTable inventory={inventory} refresh={fetchData} />
          )}

          {activeTab === "orders" && (
            <OrderHistory orders={orders} refresh={fetchData} />
          )}
        </div>
      </div>

      {/* ── FLOATING AI CHAT ── */}
      <ChatBot />
    </div>
  );
}