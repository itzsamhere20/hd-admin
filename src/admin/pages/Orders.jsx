import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import {
  Package,
  TrendingUp,
  ShoppingBag,
  Eye,
  Search,
  X,
  ChevronDown,
  MessageCircle,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ArrowUpDown,
  Trash2,
  AlertTriangle,
  Sparkles,
  Flame,
} from "lucide-react";

/* =========================
   STUCK ORDER HELPERS
========================= */
const MS_IN_DAY = 1000 * 60 * 60 * 24;
const getOrderAgeDays = (createdAt) =>
  Math.floor((Date.now() - new Date(createdAt)) / MS_IN_DAY);

// returns severity config only for PROCESSING orders that are stuck
const getStuckSeverity = (order) => {
  if (order.orderStatus !== "PROCESSING") return null;
  const days = getOrderAgeDays(order.createdAt);
  if (days >= 7)
    return {
      level: "critical",
      label: `${days}d — Urgent`,
      cardBg: "bg-red-50/60",
      cardBorder: "border-red-400",
      badgeBg: "bg-red-500",
      badgeText: "text-white",
      glow: "shadow-[0_0_0_1px_rgba(239,68,68,0.3),0_4px_20px_rgba(239,68,68,0.15)]",
      barColor: "bg-red-500",
    };
  if (days >= 3)
    return {
      level: "warning",
      label: `${days}d — Review`,
      cardBg: "bg-orange-50/60",
      cardBorder: "border-orange-400",
      badgeBg: "bg-orange-500",
      badgeText: "text-white",
      glow: "shadow-[0_0_0_1px_rgba(249,115,22,0.3),0_4px_20px_rgba(249,115,22,0.12)]",
      barColor: "bg-orange-400",
    };
  if (days >= 1)
    return {
      level: "mild",
      label: `${days}d — Check`,
      cardBg: "bg-yellow-50/40",
      cardBorder: "border-yellow-300",
      badgeBg: "bg-yellow-400",
      badgeText: "text-yellow-900",
      glow: "shadow-[0_0_0_1px_rgba(234,179,8,0.25),0_4px_16px_rgba(234,179,8,0.10)]",
      barColor: "bg-yellow-400",
    };
  return null;
};

/* =========================
   WHATSAPP HELPER
========================= */
const WA_MESSAGES = {
  CONFIRMED: (order) =>
    `ORDER CONFIRMED

Dear ${order.customer?.name},

Your order #${order.orderId} has been confirmed and is now being prepared.

ITEMS:
${order.items?.map((i) => `- ${i.name} x ${i.quantity}`).join("\n")}

TOTAL: PKR ${Number(order.totalAmount).toLocaleString()}

Thank you for your order.`,

  SHIPPED: (order) =>
    `ORDER SHIPPED

Dear ${order.customer?.name},

Your order #${order.orderId} has been shipped and is on its way to you.

Delivery time: 2-5 business days

TOTAL: PKR ${Number(order.totalAmount).toLocaleString()}

Contact us if you need help.`,

  DELIVERED: (order) =>
    `ORDER DELIVERED

Dear ${order.customer?.name},

Your order #${order.orderId} has been successfully delivered.

We hope you are satisfied with your purchase.

Please share your feedback with us.`,

  CANCELLED: (order) =>
    `ORDER CANCELLED

Dear ${order.customer?.name},

Your order #${order.orderId} has been cancelled.

AMOUNT: PKR ${Number(order.totalAmount).toLocaleString()}

If you have questions, contact support.`,

  PROCESSING: (order) =>
    `ORDER PROCESSING

Dear ${order.customer?.name},

Your order #${order.orderId} is currently being processed.

We will update you once it moves forward.

TOTAL: PKR ${Number(order.totalAmount).toLocaleString()}`,
};

const sendWhatsApp = (order, status) => {
  const raw = order.customer?.phone?.toString().replace(/\D/g, "");
  if (!raw) return;
  const phone = raw.startsWith("92") ? raw : `92${raw.replace(/^0/, "")}`;
  const message = WA_MESSAGES[status]?.(order);
  if (!message) return;
  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    "_blank",
  );
};

/* =========================
   STATUS CONFIG
========================= */
const STATUS_CONFIG = {
  PROCESSING: {
    label: "Processing",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  DELIVERED: {
    label: "Delivered",
    icon: PackageCheck,
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-400",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
  },
};

/* =========================
   MAIN COMPONENT
========================= */
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  /* FETCH */
  useEffect(() => {
    let interval;

    const fetchOrders = async (silent = false) => {
      try {
        const res = await api.get("/orders/all");
        const newOrders = res.data || [];

        setOrders((prev) => {
          // preserve "isRead" state locally (important for badge)
          const map = new Map(prev.map((o) => [o._id, o]));

          const merged = newOrders.map((o) => ({
            ...o,
            isRead: map.get(o._id)?.isRead ?? o.isRead,
          }));

          return merged;
        });
      } catch (err) {
        if (!silent) toast.error("Failed to refresh orders");
      } finally {
        setLoading(false);
      }
    };

    // initial fetch
    fetchOrders();

    // polling every 15 seconds
    interval = setInterval(() => {
      fetchOrders(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  /* MARK AS READ */
  const markAsRead = async (order) => {
    if (order.isRead) return;
    setOrders((prev) =>
      prev.map((o) => (o._id === order._id ? { ...o, isRead: true } : o)),
    );
    try {
      await api.put(`/orders/${order._id}/read`);
    } catch (err) {
      console.error(err);
    }
  };

  /* VIEW — marks as read */
  const handleView = (order) => {
    setSelectedOrder(order);
    markAsRead(order);
  };

  /* UPDATE STATUS */
  const updateStatus = async (order, status) => {
    if (order.orderStatus === status) return;
    setUpdatingId(order._id);
    try {
      await api.put(`/orders/${order._id}/status`, { status });
      const updated = { ...order, orderStatus: status, isRead: true };
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
      if (selectedOrder?._id === order._id) setSelectedOrder(updated);
      toast.success(`Status → ${status}`);
      sendWhatsApp(updated, status);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  /* DELETE */
  const confirmDelete = (order) => setDeleteTarget(order);
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/orders/${deleteTarget._id}`);
      setOrders((prev) => prev.filter((o) => o._id !== deleteTarget._id));
      if (selectedOrder?._id === deleteTarget._id) setSelectedOrder(null);
      toast.success("Order deleted");
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  /* FILTER / SEARCH / SORT */
  const filteredOrders = useMemo(() => {
    let data = [...orders];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(q) ||
          o.customer?.email?.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.customer?.phone?.includes(search),
      );
    }
    if (statusFilter !== "ALL")
      data = data.filter((o) => o.orderStatus === statusFilter);
    if (sort === "NEWEST")
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "OLDEST")
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "HIGHEST") data.sort((a, b) => b.totalAmount - a.totalAmount);
    return data;
  }, [orders, search, statusFilter, sort]);

  /* ANALYTICS */
  const deliveredOrders = orders.filter((o) => o.orderStatus === "DELIVERED");
  const totalRevenue = deliveredOrders.reduce(
    (a, b) => a + Number(b.totalAmount || 0),
    0,
  );
  const totalOrders = orders.length;
  const deliveredCount = deliveredOrders.length;
  const newOrdersCount = orders.filter((o) => !o.isRead).length;

  /* LOADING */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="font-cormorant text-xl text-gray-500 tracking-widest">
            Loading Orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* PING KEYFRAMES */}
      <style>{`
        @keyframes echo {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.8); opacity: 0;   }
          100% { transform: scale(2.8); opacity: 0;   }
        }
        .echo-ring {
          animation: echo 1.6s ease-out infinite;
        }
        @keyframes echo2 {
          0%   { transform: scale(1);   opacity: 0.5; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .echo-ring-2 {
          animation: echo2 1.6s ease-out 0.4s infinite;
        }
      `}</style>

      {/* HEADER */}
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-luxury text-4xl lg:text-5xl text-gray-800 tracking-tight">
            Orders
          </h1>
          <p className="font-cormorant text-xl text-gray-500 mt-1">
            Manage & track all customer orders
          </p>
        </div>
        {newOrdersCount > 0 && (
          <div className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-2xl">
            <Sparkles size={14} className="shrink-0" />
            {newOrdersCount} new order{newOrdersCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<ShoppingBag size={20} />}
          title="Total Orders"
          value={totalOrders}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Total Revenue"
          value={`PKR ${totalRevenue.toLocaleString()}`}
        />
        <StatCard
          icon={<Package size={20} />}
          title="Delivered"
          value={deliveredCount}
          sub={`of ${totalOrders} orders`}
        />
      </div>

      {/* CONTROLS */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex items-center gap-3 border border-[#e7dcc7] rounded-2xl px-4 py-3 flex-1">
            <Search size={17} className="text-gray-400 shrink-0" />
            <input
              className="w-full outline-none bg-transparent text-sm placeholder:text-gray-400"
              placeholder="Search by order ID, email, name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={15} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <div className="relative">
            <select
              className="appearance-none border border-[#e7dcc7] rounded-2xl px-4 py-3 pr-10 bg-white outline-none text-sm w-full lg:w-[180px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PROCESSING">Processing</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none border border-[#e7dcc7] rounded-2xl px-4 py-3 pr-10 bg-white outline-none text-sm w-full lg:w-[180px]"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="HIGHEST">Highest Amount</option>
            </select>
            <ArrowUpDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* RESULTS COUNT */}
      <p className="text-sm text-gray-400 mb-4 px-1">
        Showing{" "}
        <span className="text-gray-700 font-medium">
          {filteredOrders.length}
        </span>{" "}
        order{filteredOrders.length !== 1 ? "s" : ""}
      </p>

      {/* ORDERS GRID */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-14 text-center">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-cormorant text-2xl text-gray-400">
            No orders found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onUpdateStatus={updateStatus}
              onView={handleView}
              onDelete={confirmDelete}
              isUpdating={updatingId === order._id}
            />
          ))}
        </div>
      )}

      {/* INVOICE MODAL */}
      {selectedOrder && (
        <InvoiceModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateStatus}
          onDelete={(o) => {
            setSelectedOrder(null);
            confirmDelete(o);
          }}
          isUpdating={updatingId === selectedOrder._id}
        />
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <DeleteModal
          order={deleteTarget}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* =========================
   ORDER CARD
========================= */
function OrderCard({ order, onUpdateStatus, onView, onDelete, isUpdating }) {
  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PROCESSING;
  const isUnread = !order.isRead;
  const stuck = getStuckSeverity(order);
  const date = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  /* card border / bg / glow — stuck takes priority over unread */
  const cardClass = stuck
    ? `${stuck.cardBg} border-2 ${stuck.cardBorder} ${stuck.glow}`
    : isUnread
      ? "bg-[#fffbf0] border-2 border-primary/50 shadow-[0_0_0_1px_rgba(166,138,60,0.2),0_4px_20px_rgba(166,138,60,0.10)]"
      : "bg-white border border-[#e7dcc7] hover:shadow-md";

  return (
    <div
      className={`relative rounded-3xl p-5 flex flex-col gap-4 transition-all duration-200 ${cardClass} ${isUnread ? "animate-pulse" : ""}`}
    >
      {/* ── NEW ORDER ECHO DOT ── */}
      {isUnread && !stuck && (
        <div className="absolute -top-1 -right-1 z-10">
          {/* echo rings */}
          <span className="absolute inset-0 rounded-full bg-primary/40 echo-ring" />
          <span className="absolute inset-0 rounded-full bg-primary/25 echo-ring-2" />
          {/* solid dot */}
          <span className="relative block w-4 h-4 rounded-full bg-primary border-2 border-white" />
        </div>
      )}
      {/* ── STUCK SEVERITY BADGE ── */}
      {stuck && (
        <div
          className={`absolute -top-3 left-4 flex items-center gap-1.5 ${stuck.badgeBg} ${stuck.badgeText} text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide`}
        >
          <Flame size={10} />
          {stuck.label}
        </div>
      )}
      {/* TOP ROW */}
      <div
        className={`flex items-start justify-between gap-3 ${stuck ? "mt-1" : ""}`}
      >
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-800 text-[15px]">
            #{order.orderId}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5 truncate">
            {order.customer?.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{date}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <button
            onClick={() => onDelete(order)}
            className="w-7 h-7 rounded-xl border border-[#e7dcc7] flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <Trash2 size={13} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
      {/* STUCK PROGRESS BAR
      {stuck && (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${stuck.barColor}`}
            style={{
              width: `${Math.min(100, (getOrderAgeDays(order.createdAt) / 4) * 100)}%`,
            }}
          />
        </div>
      )} */}
      {/* PRODUCT IMAGES */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {order.items?.slice(0, 5).map((item, idx) => (
          <div key={idx} className="relative shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className={`w-14 h-14 rounded-xl object-cover border ${isUnread && !stuck ? "border-primary/20" : "border-[#e7dcc7]"}`}
            />
            {item.quantity > 1 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                {item.quantity}
              </span>
            )}
          </div>
        ))}
        {order.items?.length > 5 && (
          <div className="w-14 h-14 rounded-xl border border-[#e7dcc7] bg-[#faf7f2] flex items-center justify-center text-xs text-gray-400 shrink-0">
            +{order.items.length - 5}
          </div>
        )}
      </div>
      {/* TOTAL */}
      <div className="flex items-center justify-between border-t border-[#f0ebe2] pt-3">
        <span className="text-sm text-gray-400">Total Amount</span>
        <span className="font-semibold text-gray-800">
          PKR {Number(order.totalAmount).toLocaleString()}
        </span>
      </div>
      {/* ACTIONS */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <select
            className={`w-full appearance-none border rounded-2xl px-3 py-2 pr-8 text-sm outline-none bg-white ${isUpdating ? "opacity-50 cursor-not-allowed" : ""} ${isUnread && !stuck ? "border-primary/25" : "border-[#e7dcc7]"}`}
            value={order.orderStatus}
            disabled={isUpdating}
            onChange={(e) => onUpdateStatus(order, e.target.value)}
          >
            <option value="PROCESSING">Processing</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {isUpdating ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          )}
        </div>
        <button
          onClick={() => sendWhatsApp(order, order.orderStatus)}
          title="Send WhatsApp"
          className="w-10 h-10 rounded-2xl border border-[#e7dcc7] bg-white flex items-center justify-center hover:bg-[#dcf8c6] hover:border-[#b2e5a0] transition-colors"
        >
          <MessageCircle size={16} className="text-[#25D366]" />
        </button>
        <button
          onClick={() => onView(order)}
          className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-2xl transition-opacity hover:opacity-80
            ${isUnread ? "bg-primary text-white" : "bg-black text-white"}`}
        >
          <Eye size={14} />
          View
        </button>
      </div>
    </div>
  );
}

/* =========================
   INVOICE MODAL
========================= */
function InvoiceModal({
  order,
  onClose,
  onUpdateStatus,
  onDelete,
  isUpdating,
}) {
  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PROCESSING;
  const date = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[99999]">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#f0ebe2] px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-luxury text-2xl text-gray-800">
              Order Details
            </h2>
            <p className="text-sm text-gray-400 font-cormorant">
              #{order.orderId} · {date}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(order)}
              className="w-9 h-9 rounded-2xl border border-[#e7dcc7] flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition"
            >
              <Trash2 size={15} className="text-gray-400 hover:text-red-500" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            <button
              onClick={() => sendWhatsApp(order, order.orderStatus)}
              className="flex items-center gap-2 text-sm border border-[#e7dcc7] px-4 py-2 rounded-2xl hover:bg-[#dcf8c6] hover:border-[#b2e5a0] transition-colors"
            >
              <MessageCircle size={15} className="text-[#25D366]" />
              Notify on WhatsApp
            </button>
          </div>

          <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Customer
            </h3>
            <Row label="Email" value={order.customer?.email} />
            <Row label="Name" value={order.customer?.name} />
            <Row label="Phone" value={order.customer?.phone} />
            <Row label="Payment" value={order.paymentMethod} />
            {order.customer?.address && (
              <Row label="Address" value={order.customer.address} right />
            )}
            {order.customer?.city && (
              <Row
                label="City"
                value={`${order.customer.city}${order.customer.postalCode ? `, ${order.customer.postalCode}` : ""}`}
              />
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Items Ordered
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 border border-[#e7dcc7] rounded-2xl p-3 bg-white"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#e7dcc7] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {item.name}
                    </p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">
                        Qty: {item.quantity}
                      </span>
                      {item.size && (
                        <span className="text-xs text-gray-400">
                          Size: {item.size}
                        </span>
                      )}
                      {item.type && (
                        <span className="text-xs text-gray-400 capitalize">
                          {item.type}
                        </span>
                      )}
                    </div>
                    {item.unitPrice && item.discount > 0 && (
                      <p className="text-xs text-gray-300 line-through mt-0.5">
                        PKR {Number(item.unitPrice).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm shrink-0 self-center">
                    PKR {Number(item.price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#f0ebe2] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-700">
                PKR {Number(order.subtotal).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-700">
                {Number(order.shippingFee) === 0
                  ? "Free"
                  : `PKR ${Number(order.shippingFee).toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-[#f0ebe2] pt-4 mt-2">
              <span className="text-gray-700 font-medium">Total</span>
              <span className="font-luxury text-2xl text-gray-800">
                PKR {Number(order.totalAmount).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t border-[#f0ebe2] pt-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Update Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, c]) => {
                const Icon = c.icon;
                const isActive = order.orderStatus === key;
                return (
                  <button
                    key={key}
                    disabled={isActive || isUpdating}
                    onClick={() => onUpdateStatus(order, key)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-sm transition
                      ${isActive ? `${c.bg} ${c.text} ${c.border} font-semibold cursor-default` : "border-[#e7dcc7] bg-white text-gray-600 hover:bg-[#faf7f2]"}
                      ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <Icon size={14} />
                    {c.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              * Changing status will open WhatsApp to notify the customer.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3 rounded-2xl font-medium hover:opacity-80 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   DELETE MODAL
========================= */
function DeleteModal({ order, deleting, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h2 className="font-luxury text-2xl text-gray-800">Delete Order?</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Order{" "}
          <span className="font-medium text-gray-800">#{order.orderId}</span> by{" "}
          <span className="font-medium text-gray-800">
            {order.customer?.name}
          </span>{" "}
          will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            disabled={deleting}
            onClick={onCancel}
            className="flex-1 h-[48px] rounded-2xl border border-[#e7dcc7] text-gray-700 hover:bg-[#faf7f2] transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={deleting}
            onClick={onConfirm}
            className="flex-1 h-[48px] rounded-2xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 font-medium"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   STAT CARD
========================= */
function StatCard({ icon, title, value, sub }) {
  return (
    <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          {title}
        </p>
        <h3 className="font-semibold text-gray-800 text-lg leading-tight">
          {value}
        </h3>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* =========================
   ROW HELPER
========================= */
function Row({ label, value, right = false }) {
  if (!value) return null;
  return (
    <div
      className={`flex justify-between text-sm gap-4 ${right ? "items-start" : "items-center"}`}
    >
      <span className="text-gray-500 shrink-0">{label}</span>
      <span
        className={`font-medium text-gray-800 ${right ? "text-right" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
