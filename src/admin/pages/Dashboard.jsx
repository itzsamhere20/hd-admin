import { useEffect, useState } from "react";
import api from "../api/api";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";

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
   CUSTOM TOOLTIP
========================= */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-[#e7dcc7] rounded-2xl px-4 py-3 shadow-md text-sm">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="font-semibold text-gray-800">
          PKR {Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

/* =========================
   MAIN COMPONENT
========================= */
export default function Dashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* FETCH ALL */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordersRes, customersRes, productsRes] = await Promise.all([
          api.get("/orders/all"),
          api.get("/user/all"),
          api.get("/products"),
        ]);
        setOrders(ordersRes.data || []);
        setCustomers(customersRes.data || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* DERIVED STATS */
  const totalRevenue = orders.reduce(
    (a, b) => a + (Number(b.totalAmount) || 0),
    0,
  );
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;

  const deliveredOrders = orders.filter(
    (o) => o.orderStatus === "DELIVERED",
  ).length;
  const processingOrders = orders.filter(
    (o) => o.orderStatus === "PROCESSING",
  ).length;
  const cancelledOrders = orders.filter(
    (o) => o.orderStatus === "CANCELLED",
  ).length;

  /* MONTHLY SALES CHART DATA */
  const chartData = (() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const map = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key])
        map[key] = {
          month: months[d.getMonth()],
          sales: 0,
          year: d.getFullYear(),
        };
      map[key].sales += Number(o.totalAmount) || 0;
    });
    return Object.values(map)
      .sort(
        (a, b) =>
          a.year - b.year || months.indexOf(a.month) - months.indexOf(b.month),
      )
      .slice(-7);
  })();

  /* RECENT ORDERS (latest 5) */
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  /* LOADING */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="font-cormorant text-xl text-gray-500 tracking-widest">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="font-luxury text-4xl lg:text-5xl text-gray-800 tracking-tight">
          Dashboard
        </h1>
        <p className="font-cormorant text-xl text-gray-500 mt-1">
          Welcome back to Hamdam Collections.
        </p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingBag size={20} />}
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          sub={`${processingOrders} processing`}
          onClick={() => navigate("/admin/orders")}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Total Revenue"
          value={`PKR ${totalRevenue.toLocaleString()}`}
          sub={`${deliveredOrders} delivered`}
          onClick={() => navigate("/admin/orders")}
        />
        <StatCard
          icon={<Package size={20} />}
          title="Products"
          value={totalProducts.toLocaleString()}
          sub="in catalogue"
          onClick={() => navigate("/admin/products/list")}
        />
        <StatCard
          icon={<Users size={20} />}
          title="Customers"
          value={totalCustomers.toLocaleString()}
          sub="registered"
          onClick={() => navigate("/admin/customers")}
        />
      </div>

      {/* ── ORDER STATUS BREAKDOWN ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = orders.filter((o) => o.orderStatus === key).length;
          const pct = totalOrders ? Math.round((count / totalOrders) * 100) : 0;
          return (
            <div
              key={key}
              className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-widest ${cfg.text} mb-2`}
              >
                {cfg.label}
              </p>
              <p className={`text-2xl font-luxury ${cfg.text}`}>{count}</p>
              <p className={`text-xs mt-1 ${cfg.text} opacity-70`}>
                {pct}% of orders
              </p>
            </div>
          );
        })}
      </div>

      {/* ── CHART ── */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 lg:p-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-luxury text-2xl lg:text-3xl text-gray-800">
              Sales Analytics
            </h2>
            <p className="font-cormorant text-lg text-gray-500 mt-1">
              Monthly revenue overview
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Total
            </p>
            <p className="font-luxury text-2xl text-gray-800">
              PKR {totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {chartData.length < 2 ? (
          <div className="h-[260px] flex items-center justify-center text-gray-300 font-cormorant text-xl">
            Not enough data yet
          </div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0ebe2"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#9c9388" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#9c9388" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#A68A3C"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#A68A3C", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#A68A3C" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── RECENT ORDERS ── */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="font-luxury text-2xl lg:text-3xl text-gray-800">
              Recent Orders
            </h2>
            <p className="font-cormorant text-lg text-gray-500 mt-0.5">
              Latest customer purchases
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 pb-10 pt-4 text-center text-gray-300 font-cormorant text-xl">
            No orders yet
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b border-[#f0ebe2]">
                    {[
                      "Order ID",
                      "Customer",
                      "Items",
                      "Amount",
                      "Status",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => {
                    const cfg =
                      STATUS_CONFIG[order.orderStatus] ||
                      STATUS_CONFIG.PROCESSING;
                    const date = new Date(order.createdAt).toLocaleDateString(
                      "en-PK",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    );
                    return (
                      <tr
                        key={order._id}
                        className={`hover:bg-[#faf7f2] transition-colors ${idx < recentOrders.length - 1 ? "border-b border-[#f9f6f1]" : ""}`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          #{order.orderId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.customer?.name || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1.5">
                            {order.items?.slice(0, 3).map((item, i) => (
                              <img
                                key={i}
                                src={item.image}
                                alt={item.name}
                                className="w-8 h-8 rounded-lg object-cover border border-[#e7dcc7]"
                              />
                            ))}
                            {order.items?.length > 3 && (
                              <div className="w-8 h-8 rounded-lg bg-[#faf7f2] border border-[#e7dcc7] flex items-center justify-center text-[10px] text-gray-400">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                          PKR {Number(order.totalAmount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                            />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="lg:hidden px-4 pb-4 space-y-3">
              {recentOrders.map((order) => {
                const cfg =
                  STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PROCESSING;
                const date = new Date(order.createdAt).toLocaleDateString(
                  "en-PK",
                  {
                    day: "numeric",
                    month: "short",
                  },
                );
                return (
                  <div
                    key={order._id}
                    className="border border-[#e7dcc7] rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          #{order.orderId}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.customer?.name} · {date}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                        />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {order.items?.slice(0, 3).map((item, i) => (
                          <img
                            key={i}
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover border border-[#e7dcc7]"
                          />
                        ))}
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">
                        PKR {Number(order.totalAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================
   STAT CARD
========================= */
function StatCard({ icon, title, value, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#e7dcc7] rounded-3xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="w-11 h-11 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-widest truncate">
          {title}
        </p>
        <h3 className="font-semibold text-gray-800 text-lg leading-tight truncate">
          {value}
        </h3>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
