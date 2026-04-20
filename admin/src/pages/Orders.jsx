import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { formatINR } from "../utils/currency";

function statusBadge(status) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status.toUpperCase()}</span>;
}

function timelineTone(event) {
  const status = String(event?.status || "").toLowerCase();
  const note = String(event?.note || "").toLowerCase();
  const byRole = String(event?.byRole || "").toLowerCase();

  if (status.includes("refund") || note.includes("refund") || note.includes("return")) return "refund";
  if (status.includes("payment") || status.includes("paid") || note.includes("payment") || note.includes("txn")) return "payment";
  if (status.includes("shipped") || status.includes("delivered") || note.includes("shipping") || note.includes("courier")) return "shipping";
  if (byRole === "admin") return "admin";
  return "default";
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundNote, setRefundNote] = useState("");
  const [refundBusy, setRefundBusy] = useState(false);

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
      setSelectedOrder(data.order);
      setRefundNote("");
      setModalOpen(true);
    } catch (err) {
      alert("Failed to load order");
    }
  }

  async function updateRefund(id, action, note = "") {
    if (!action) return;
    try {
      setRefundBusy(true);
      const token = localStorage.getItem("vastra_admin_token");
      const res = await fetch(`/api/orders/admin/${id}/refund`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, note }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Refund ${action}d`);
        await loadOrders();
        await viewOrder(id);
      } else {
        toast(data.message || "Refund update failed");
      }
    } catch (err) {
      alert("Error updating refund status");
    } finally {
      setRefundBusy(false);
    }
  }

  const timeline = (selectedOrder?.trackingEvents || [])
    .slice()
    .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

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
              <th>REFUND</th>
              <th>STATUS</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!orders.length ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
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
                  <td>
                    {o.refundStatus ? (
                      <span className={`badge badge-refund-${String(o.refundStatus).toLowerCase()}`}>{o.refundStatus}</span>
                    ) : (
                      <span style={{ color: "#999", fontSize: 11 }}>-</span>
                    )}
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
                    {o.refundStatus === "Requested" ? (
                      <select
                        onChange={(e) => updateRefund(o._id, e.target.value, "")}
                        style={{ padding: 4, border: "1px solid #ddd", fontSize: 11, cursor: "pointer" }}
                        defaultValue=""
                      >
                        <option value="">Refund</option>
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                      </select>
                    ) : null}
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
          {!selectedOrder ? null : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <p style={{ fontSize: 11, color: "#888", letterSpacing: 1 }}>ORDER ID</p>
                  <p style={{ fontFamily: "monospace" }}>#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#888", letterSpacing: 1 }}>DATE</p>
                  <p>{new Date(selectedOrder.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#888", letterSpacing: 1 }}>CUSTOMER</p>
                  <p>{selectedOrder.guestInfo?.firstName || ""} {selectedOrder.guestInfo?.lastName || ""}</p>
                  <p style={{ fontSize: 12, color: "#888" }}>{selectedOrder.guestInfo?.email || ""} · {selectedOrder.guestInfo?.phone || ""}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#888", letterSpacing: 1 }}>SHIPPING TO</p>
                  <p>{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                </div>
              </div>

              <h3 style={{ letterSpacing: 2, fontSize: 12, marginBottom: "1rem" }}>ITEMS</h3>
              {(selectedOrder.items || []).map((item, idx) => (
                <div key={`${selectedOrder._id}-${idx}`} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <img alt={item.name || "Order item"} src={item.image} style={{ width: 50, height: 60, objectFit: "cover" }} onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/50"; }} />
                  <div style={{ flex: 1 }}>
                    <p>{item.name}</p>
                    <p style={{ fontSize: 12, color: "#888" }}>Size: {item.size} · Qty: {item.quantity}</p>
                  </div>
                  <p>{formatINR(Number(item.price || 0) * Number(item.quantity || 0))}</p>
                </div>
              ))}

              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "2px solid #000" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>Subtotal</span><span>{formatINR(selectedOrder.subtotal || 0)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>Shipping</span><span>{formatINR(selectedOrder.shippingCost || 0)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>Tax</span><span>{formatINR(selectedOrder.tax || 0)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}><span>TOTAL</span><span>{formatINR(selectedOrder.totalAmount || 0)}</span></div>
              </div>

              <h3 style={{ letterSpacing: 2, fontSize: 12, marginTop: "1.2rem", marginBottom: "0.6rem" }}>ORDER TIMELINE</h3>
              <div className="order-timeline">
                {!timeline.length ? (
                  <div style={{ color: "#888", fontSize: 12 }}>No timeline events.</div>
                ) : timeline.map((event, idx) => (
                  <div className={`order-timeline-item order-timeline-item-${timelineTone(event)}`} key={`${selectedOrder._id}-evt-${idx}`}>
                    <div className="order-timeline-head">
                      <span className="order-timeline-status">{event.status || "Update"}</span>
                      <span className="order-timeline-role">{String(event.byRole || "system").toUpperCase()}</span>
                    </div>
                    <div className="order-timeline-note">{event.note || "-"}</div>
                    <div className="order-timeline-time">{event.createdAt ? new Date(event.createdAt).toLocaleString("en-IN") : ""}</div>
                  </div>
                ))}
              </div>

              {selectedOrder.refundStatus === "Requested" ? (
                <div style={{ marginTop: "1rem", borderTop: "1px solid #e8e8e8", paddingTop: "1rem" }}>
                  <h3 style={{ letterSpacing: 2, fontSize: 12, marginBottom: "0.6rem" }}>REFUND ACTION</h3>
                  <textarea
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    placeholder="Add note for customer (optional)"
                    style={{ width: "100%", minHeight: 84, padding: 10, border: "1px solid #ddd", fontSize: 13 }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      disabled={refundBusy}
                      onClick={() => updateRefund(selectedOrder._id, "approve", refundNote)}
                    >
                      {refundBusy ? "PROCESSING..." : "APPROVE REFUND"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={refundBusy}
                      onClick={() => updateRefund(selectedOrder._id, "reject", refundNote)}
                    >
                      {refundBusy ? "PROCESSING..." : "REJECT REFUND"}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div id="admin-toast"></div>
    </AdminLayout>
  );
}
