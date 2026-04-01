import { useEffect, useState } from "react";
import http from "../../api/http";

export default function OrderManagement() {
  const [experimentId, setExperimentId] = useState("");
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const fetchAllOrders = async () => {
    const res = await http.get("/orders");
    setAllOrders(res.data);
    setOrders(res.data);
    setIsFiltered(false);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await http.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((order) => (order.order_id === orderId ? { ...order, status: res.data.order.status } : order)));
    } catch (error) {
      console.error("Failed to update order status", error);
      alert(error?.response?.data?.message || "Could not update status");
    }
  };

  const fetchOrders = async () => {
    const res = await http.get(`/orders/${experimentId}`);
    setOrders(res.data.orders);
    setIsFiltered(true);
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    delivered: "bg-sky-100 text-sky-700 border-sky-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const statusIcons = {
    pending: "⏳",
    confirmed: "✅",
    delivered: "📦",
    cancelled: "❌",
  };

  const getPreviousStatus = (status) => {
    const order = ["pending", "confirmed", "delivered"];
    const idx = order.indexOf(status);
    if (idx > 0) return order[idx - 1];
    return null;
  };

  const renderStatusPill = (status) => (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      <span>{statusIcons[status] || "ℹ️"}</span>
      {status}
    </span>
  );

  return (
    <div className="p-6 bg-white rounded-3xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Orders 📦</h2>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Enter Experiment ID"
          value={experimentId}
          onChange={(e) => setExperimentId(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={fetchOrders}
          className="bg-sky-600 text-white p-2 rounded-xl"
        >
          Filter by Experiment
        </button>
        {isFiltered && (
          <button
            onClick={fetchAllOrders}
            className="bg-green-600 text-white px-4 rounded-xl"
          >
            Show All Orders
          </button>
        )}
      </div>

      <p className="mb-4 text-gray-600">
        {isFiltered ? `Showing orders for experiment ${experimentId}` : `Showing all orders (${orders.length} total)`}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-sm">
          <thead className="bg-slate-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kid</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Experiment (ID)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ordered At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800">{order.order_id}</td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  <div className="font-semibold">{order.kid_id?.name || order.kid_id}</div>
                  <div className="text-xs text-gray-500">{order.kid_id?.email || ''}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  <div className="font-semibold">{order.experiment_id?.title || order.experiment_id}</div>
                  <div className="text-xs text-gray-500">ID: {order.experiment_id?.experiment_id || order.experiment_id}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">{order.quantity}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    {renderStatusPill(order.status)}
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">{order.notes || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}