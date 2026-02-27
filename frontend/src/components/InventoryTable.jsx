import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateStock,
  manualOrder,
  deleteItem,
  addItem
} from "../api/inventoryApi";
import { getStatusBadge } from "../utils/statusHelper";

export default function InventoryTable({ inventory = [], refresh }) {
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "liquor",
    current_stock: "",
    base_threshold: "",
    max_capacity: "",
    unit: "bottles"
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleUpdate = async (id) => {
    await updateStock(id, parseInt(editVal));
    setEditId(null);
    refresh();
  };

  const handleManualOrder = async (id, name) => {
    await manualOrder(id);
    showToast(`Manual order placed for ${name}`);
    refresh();
  };

  const handleDelete = async (id) => {
    await deleteItem(id);
    refresh();
  };

  const handleAdd = async () => {
    await addItem({
      ...form,
      current_stock: parseInt(form.current_stock),
      base_threshold: parseInt(form.base_threshold),
      max_capacity: parseInt(form.max_capacity)
    });
    setShowAdd(false);
    setForm({
      name: "",
      category: "liquor",
      current_stock: "",
      base_threshold: "",
      max_capacity: "",
      unit: "bottles"
    });
    refresh();
  };

  const filtered =
    filter === "all"
      ? inventory
      : inventory.filter(
          i => i.status === filter || i.category === filter
        );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-100 via-white to-slate-200 font-['Inter']">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1
          className="
            text-4xl font-extrabold tracking-tight
            bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-rose-500
            bg-clip-text text-transparent
          "
        >
          Inventory Management
        </h1>
        <p className="mt-2 text-slate-500">
          Real-time control with intelligent actions
        </p>
      </motion.div>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="
              mb-6 mx-auto w-fit
              bg-emerald-100 text-emerald-900
              px-6 py-3 rounded-xl
              shadow-lg font-medium
            "
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTERS + ADD */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {["all", "liquor", "food", "beverage", "low", "critical"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-slate-600 shadow hover:shadow-md"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="
            bg-gradient-to-r from-emerald-500 to-teal-500
            text-white px-6 py-2 rounded-full
            shadow-lg hover:shadow-xl transition
            font-medium
          "
        >
          + Add Item
        </button>
      </div>

      {/* ADD FORM */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="
              mb-8
              bg-white/80 backdrop-blur-xl
              rounded-3xl p-6
              shadow-[0_30px_70px_rgba(0,0,0,0.15)]
              grid grid-cols-2 md:grid-cols-3 gap-4
            "
          >
            <input placeholder="Name" className="input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />

            <select className="input" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="liquor">Liquor</option>
              <option value="food">Food</option>
              <option value="beverage">Beverage</option>
            </select>

            <input type="number" placeholder="Current Stock" className="input"
              value={form.current_stock}
              onChange={e => setForm({ ...form, current_stock: e.target.value })} />

            <input type="number" placeholder="Base Threshold" className="input"
              value={form.base_threshold}
              onChange={e => setForm({ ...form, base_threshold: e.target.value })} />

            <input type="number" placeholder="Max Capacity" className="input"
              value={form.max_capacity}
              onChange={e => setForm({ ...form, max_capacity: e.target.value })} />

            <input placeholder="Unit" className="input"
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })} />

            <button
              onClick={handleAdd}
              className="
                col-span-2 md:col-span-3
                bg-gradient-to-r from-indigo-600 to-purple-600
                text-white py-3 rounded-xl
                font-semibold shadow-lg
              "
            >
              Save Item
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABLE */}
      <div
        className="
          bg-white/80 backdrop-blur-xl
          rounded-3xl overflow-hidden
          shadow-[0_30px_70px_rgba(0,0,0,0.15)]
        "
      >
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              {["Name", "Category", "Stock", "Threshold", "Unit", "Status", "Updated", "Actions"].map(h => (
                <th key={h} className="px-4 py-4 text-left">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filtered.map(item => {
              const badge = getStatusBadge(item.status);
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                >
                  <td className="px-4 py-4 font-medium">{item.name}</td>
                  <td className="px-4 py-4 capitalize">{item.category}</td>

                  <td className="px-4 py-4">
                    {editId === item.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          className="input w-20"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                        />
                        <button onClick={() => handleUpdate(item.id)} className="btn-success">✓</button>
                        <button onClick={() => setEditId(null)} className="btn-muted">✕</button>
                      </div>
                    ) : (
                      <span
                        onClick={() => {
                          setEditId(item.id);
                          setEditVal(item.current_stock);
                        }}
                        className="cursor-pointer text-indigo-600 font-bold hover:underline"
                      >
                        {item.current_stock}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">{item.base_threshold}</td>
                  <td className="px-4 py-4">{item.unit}</td>
                  <td className="px-4 py-4">
                    <span className={badge.className}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-400">
                    {new Date(item.last_updated).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleManualOrder(item.id, item.name)}
                        className="btn-primary"
                      >
                        Order
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}