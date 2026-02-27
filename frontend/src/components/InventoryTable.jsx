import { useState } from "react";
import { updateStock, manualOrder, deleteItem, addItem } from "../api/inventoryApi";
import { getStatusBadge } from "../utils/statusHelper";

export default function InventoryTable({ inventory, refresh }) {
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "liquor", current_stock: "", base_threshold: "", max_capacity: "", unit: "bottles" });
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

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
    await addItem({ ...form, current_stock: parseInt(form.current_stock), base_threshold: parseInt(form.base_threshold), max_capacity: parseInt(form.max_capacity) });
    setShowAdd(false);
    setForm({ name: "", category: "liquor", current_stock: "", base_threshold: "", max_capacity: "", unit: "bottles" });
    refresh();
  };

  const filtered = filter === "all" ? inventory : inventory.filter(i => i.status === filter || i.category === filter);

  return (
    <div className="space-y-4">
      {toast && <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">{toast}</div>}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {["all", "liquor", "food", "beverage", "low", "critical"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${filter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Item
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <input placeholder="Name" className="border rounded px-3 py-2 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <select className="border rounded px-3 py-2 text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            <option value="liquor">Liquor</option>
            <option value="food">Food</option>
            <option value="beverage">Beverage</option>
          </select>
          <input placeholder="Current Stock" type="number" className="border rounded px-3 py-2 text-sm" value={form.current_stock} onChange={e => setForm({...form, current_stock: e.target.value})} />
          <input placeholder="Base Threshold" type="number" className="border rounded px-3 py-2 text-sm" value={form.base_threshold} onChange={e => setForm({...form, base_threshold: e.target.value})} />
          <input placeholder="Max Capacity" type="number" className="border rounded px-3 py-2 text-sm" value={form.max_capacity} onChange={e => setForm({...form, max_capacity: e.target.value})} />
          <input placeholder="Unit (bottles/units/kg)" className="border rounded px-3 py-2 text-sm" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
          <button onClick={handleAdd} className="col-span-2 md:col-span-3 bg-green-600 text-white py-2 rounded-lg font-medium">Save Item</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {["Name", "Category", "Stock", "Threshold", "Unit", "Status", "Updated", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => {
              const badge = getStatusBadge(item.status);
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 capitalize">{item.category}</td>
                  <td className="px-4 py-3">
                    {editId === item.id ? (
                      <div className="flex gap-1">
                        <input type="number" className="border rounded px-2 py-1 w-20 text-sm" value={editVal}
                          onChange={e => setEditVal(e.target.value)} />
                        <button onClick={() => handleUpdate(item.id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">✓</button>
                        <button onClick={() => setEditId(null)} className="bg-gray-300 px-2 py-1 rounded text-xs">✗</button>
                      </div>
                    ) : (
                      <span onClick={() => { setEditId(item.id); setEditVal(item.current_stock); }}
                        className="cursor-pointer hover:underline text-indigo-600 font-bold">{item.current_stock}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{item.base_threshold}</td>
                  <td className="px-4 py-3">{item.unit}</td>
                  <td className="px-4 py-3"><span className={badge.className}>{badge.label}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(item.last_updated).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleManualOrder(item.id, item.name)}
                        className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium hover:bg-indigo-200">Order</button>
                      <button onClick={() => handleDelete(item.id)}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium hover:bg-red-200">Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
