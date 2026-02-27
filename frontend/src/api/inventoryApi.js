import axios from "axios";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getInventory = () => axios.get(`${BASE}/inventory/`);
export const getOrders = () => axios.get(`${BASE}/orders/`);
export const updateStock = (id, stock) => axios.put(`${BASE}/inventory/${id}`, { current_stock: stock });
export const manualOrder = (id) => axios.post(`${BASE}/orders/manual/${id}`);
export const fulfillOrder = (id) => axios.put(`${BASE}/orders/${id}/fulfill`);
export const addItem = (item) => axios.post(`${BASE}/inventory/`, item);
export const deleteItem = (id) => axios.delete(`${BASE}/inventory/${id}`);
