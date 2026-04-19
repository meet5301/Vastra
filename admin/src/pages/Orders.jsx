import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { formatINR } from "../utils/currency";

function statusBadge(status) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status.toUpperCase()}</span>;
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailHtml, setDetailHtml] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("vastra_admin_token");
    if (!token) navigate("/");
  }, [navigate]);

  const loadOrders = useCallback(async () => {
    const status = statusFilter;
    const url = `/api/orders/admin/all?limit=50${status ? `&status=${status}` : ""}`;
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTotal(data.total || 0);
      setOrders(data.orders || []);
    } catch (err) {
      setTotal(0);
      setOrders([]);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function toast(msg) {
    const t = document.getElementById("admin-toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(() => (t.style.display = "none"), 2500);
  }


  async function updateStatus(id, status) {
    if (!status) return;
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/orders/admin/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderStatus: status }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Status updated to ${status}`);
        loadOrders();
      }
    } catch (err) {
      alert("Error updating status");
    }
  }

  async function viewOrder(id) {
    try {
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/orders/${id}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) return;
      const o = data.order;
      const html = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
          <div>
            <p style="font-size:11px;color:#888;letter-spacing:1px;">ORDER ID</p>
            <p style="font-family:monospace;">#${o._id.slice(-8).toUpperCase()}</p>
          </div>
          <div>
            <p style="font-size:11px;color:#888;letter-spacing:1px;">DATE</p>
            <p>${new Date(o.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p style="font-size:11px;color:#888;letter-spacing:1px;">CUSTOMER</p>
            <p>${o.guestInfo?.firstName || ""} ${o.guestInfo?.lastName || ""}</p>
            <p style="font-size:12px;color:#888;">${o.guestInfo?.email || ""} · ${o.guestInfo?.phone || ""}</p>
          </div>
          <div>
            <p style="font-size:11px;color:#888;letter-spacing:1px;">SHIPPING TO</p>
            <p>${o.shippingAddress?.address}, ${o.shippingAddress?.city}</p>
          </div>
        </div>
        <h3 style="letter-spacing:2px;font-size:12px;margin-bottom:1rem;">ITEMS</h3>
        ${o.items
          .map(
            (i) => `
          <div style="display:flex;align-items:center;gap:1rem;padding:8px 0;border-bottom:1px solid #f5f5f5;">
            <img src="${i.image}" style="width:50px;height:60px;object-fit:cover;" onerror="this.src='https://via.placeholder.com/50'">
            <div style="flex:1;"><p>${i.name}</p><p style="font-size:12px;color:#888;">Size: ${i.size} · Qty: ${i.quantity}</p></div>
            <p>Rs. ${Math.round(i.price * i.quantity).toLocaleString("en-IN")}</p>
          </div>`
          )
          .join("")}
        <div style="margin-top:1rem;padding-top:1rem;border-top:2px solid #000;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>Subtotal</span><span>Rs. ${Math.round(o.subtotal || 0).toLocaleString("en-IN")}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>Shipping</span><span>Rs. ${Math.round(o.shippingCost || 0).toLocaleString("en-IN")}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;"><span>TOTAL</span><span>Rs. ${Math.round(o.totalAmount || 0).toLocaleString("en-IN")}</span></div>
        </div>`;
      setDetailHtml(html);
      setModalOpen(true);
    } catch (err) {
      alert("Failed to load order");
    }
  }

  return (
    <AdminLayout active="orders" title="ORDERS">
      <div className="filter-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option>Processing</option>
          <option>Confirmed</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
      </div>

      <div className="table-section">
        <div className="table-header">
          <h3>ALL ORDERS <span id="order-count" style={{ color: "#888", fontSize: 12 }}>({total})</span></h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>ITEMS</th>
              <th>TOTAL</th>
              <th>PAYMENT</th>
              <th>STATUS</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!orders.length ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>#{o._id.slice(-8).toUpperCase()}</td>
                  <td>
                    {o.user?.username || `${o.guestInfo?.firstName || ""} ${o.guestInfo?.lastName || ""}` || "Guest"}
                    <br />
                    <span style={{ fontSize: 11, color: "#888" }}>{o.user?.email || o.guestInfo?.email || ""}</span>
                  </td>
                  <td>{o.items.length}</td>
                  <td>{formatINR(o.totalAmount)}</td>
                  <td>
                    <span className={`badge badge-${o.paymentStatus.toLowerCase()}`}>{o.paymentStatus}</span>
                  </td>
                  <td>{statusBadge(o.orderStatus)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  <td style={{ display: "flex", gap: 4, paddingTop: 14 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => viewOrder(o._id)}>VIEW</button>
                    <select
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      style={{ padding: 4, border: "1px solid #ddd", fontSize: 11, cursor: "pointer" }}
                      defaultValue=""
                    >
                      <option value="">Update</option>
                      <option>Processing</option>
                      <option>Confirmed</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`modal-overlay ${modalOpen ? "open" : ""}`} id="order-modal">
        <div className="modal" style={{ width: 640 }}>
          <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
          <h2>ORDER DETAIL</h2>
          <div id="order-detail-content" dangerouslySetInnerHTML={{ __html: detailHtml }}></div>
        </div>
      </div>

      <div id="admin-toast"></div>
    </AdminLayout>
  );
}
