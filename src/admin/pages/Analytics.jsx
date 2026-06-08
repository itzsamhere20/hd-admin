import { useEffect, useState, useMemo } from "react";
import api from "../api/api";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  PackageCheck,
  XCircle,
  Truck,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ── PALETTE ── */
const GOLD = "#A68A3C";
const CREAM = "#f7f4ef";
const BORDER = "#e7dcc7";

const STATUS_COLORS = {
  PROCESSING: "#F59E0B",
  CONFIRMED: "#10B981",
  SHIPPED: "#3B82F6",
  DELIVERED: "#8B5CF6",
  CANCELLED: "#EF4444",
};

/* ── CUSTOM TOOLTIP ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e7dcc7] rounded-2xl px-4 py-3 shadow-md text-sm">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name === "revenue" || p.name === "sales"
            ? `PKR ${Number(p.value).toLocaleString()}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(6); // months to show

  useEffect(() => {
    (async () => {
      try {
        const [o, c, p] = await Promise.all([
          api.get("/orders/all"),
          api.get("/user/all"),
          api.get("/products"),
        ]);
        setOrders(o.data || []);
        setCustomers(c.data || []);
        setProducts(p.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── DERIVED DATA ── */
  const derived = useMemo(() => {
    const MONTHS = [
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
    const now = new Date();

    // filter to range
    const cutoff = new Date(now.getFullYear(), now.getMonth() - (range - 1), 1);
    const inRange = orders.filter((o) => new Date(o.createdAt) >= cutoff);

    /* ── MONTHLY REVENUE + ORDERS ── */
    const monthMap = {};
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthMap[key] = {
        month: MONTHS[d.getMonth()],
        revenue: 0,
        orders: 0,
      };
    }
    inRange.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (monthMap[key]) {
        if (o.orderStatus === "DELIVERED") {
          monthMap[key].revenue += Number(o.totalAmount) || 0;
        }

        monthMap[key].orders += 1;
      }
    });
    const monthlyData = Object.values(monthMap);

    /* ── STATUS BREAKDOWN ── */
    const statusMap = {
      PROCESSING: 0,
      CONFIRMED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    orders.forEach((o) => {
      if (statusMap[o.orderStatus] !== undefined) statusMap[o.orderStatus]++;
    });
    const statusData = Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
    }));

    /* ── PAYMENT METHOD ── */
    const pmMap = {};
    orders.forEach((o) => {
      const pm = o.paymentMethod || "OTHER";
      pmMap[pm] = (pmMap[pm] || 0) + 1;
    });
    const paymentData = Object.entries(pmMap).map(([name, value]) => ({
      name,
      value,
    }));

    /* ── TOP PRODUCTS (DELIVERED ONLY) ── */
    const productMap = {};

    orders.forEach((o) => {
      if (o.orderStatus !== "DELIVERED") return;

      o.items?.forEach((item) => {
        const key = item.name || "Unknown";

        if (!productMap[key]) {
          productMap[key] = { name: key, qty: 0, revenue: 0 };
        }

        productMap[key].qty += Number(item.quantity) || 1;
        productMap[key].revenue +=
          (Number(item.price) || 0) * (Number(item.quantity) || 1);
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    /* ── CITY BREAKDOWN ── */
    const cityMap = {};
    orders.forEach((o) => {
      const city = o.customer?.city || "Unknown";
      cityMap[city] = (cityMap[city] || 0) + 1;
    });
    const cityData = Object.entries(cityMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    /* ── SUMMARY STATS ── */
    const deliveredOrdersList = orders.filter(
      (o) => o.orderStatus === "DELIVERED",
    );

    const totalRevenue = deliveredOrdersList.reduce(
      (a, b) => a + (Number(b.totalAmount) || 0),
      0,
    );
    const prevCutoff = new Date(
      now.getFullYear(),
      now.getMonth() - range * 2,
      1,
    );
    const prevRange = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= prevCutoff && d < cutoff;
    });
    const prevRevenue = prevRange
      .filter((o) => o.orderStatus === "DELIVERED")
      .reduce((a, b) => a + (Number(b.totalAmount) || 0), 0);
    const revenueChange = prevRevenue
      ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
      : null;
    const deliveredOrders = deliveredOrdersList.length;

    const cancelledOrders = orders.filter(
      (o) => o.orderStatus === "CANCELLED",
    ).length;
    const avgOrderValue = orders.length
      ? Math.round(totalRevenue / orders.length)
      : 0;
    const conversionRate =
      orders.length && customers.length
        ? ((orders.length / customers.length) * 100).toFixed(1)
        : 0;

    // NEW customers this period
    const newCustomers = customers.filter(
      (c) => new Date(c.createdAt) >= cutoff,
    ).length;

    return {
      monthlyData,
      statusData,
      paymentData,
      topProducts,
      cityData,
      totalRevenue,
      revenueChange,
      deliveredOrders,
      cancelledOrders,
      avgOrderValue,
      conversionRate,
      newCustomers,
    };
  }, [orders, customers, products, range]);

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="font-cormorant text-xl text-gray-500 tracking-widest">
            Building analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 space-y-6">
      {/* ── HEADER ── */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-luxury text-4xl lg:text-5xl text-gray-800 tracking-tight">
            Analytics
          </h1>
          <p className="font-cormorant text-xl text-gray-500 mt-1">
            Business performance overview
          </p>
        </div>
        {/* RANGE SELECTOR */}
        <div className="flex items-center gap-2 bg-white border border-[#e7dcc7] rounded-2xl p-1.5">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setRange(m)}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                range === m
                  ? "bg-primary text-white font-medium"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={<TrendingUp size={20} className="text-primary/80" />}
          title="Total Revenue"
          value={`PKR ${derived.totalRevenue.toLocaleString()}`}
          change={derived.revenueChange}
          sub="all time"
        />
        <KpiCard
          icon={<ShoppingBag size={20} className="text-primary/80" />}
          title="Total Orders"
          value={orders.length}
          sub={`${derived.deliveredOrders} delivered`}
        />
        <KpiCard
          icon={<Users size={20} className="text-primary/80" />}
          title="Customers"
          value={customers.length}
          sub={`+${derived.newCustomers} this period`}
        />
        <KpiCard
          icon={<Package size={20} className="text-primary/80" />}
          title="Avg Order Value"
          value={`PKR ${derived.avgOrderValue.toLocaleString()}`}
          sub={`${derived.conversionRate}% conversion`}
        />
      </div>

      {/* ── REVENUE LINE CHART ── */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 lg:p-7">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-luxury text-2xl text-gray-800">
              Revenue Over Time
            </h2>
            <p className="font-cormorant text-lg text-gray-500 mt-0.5">
              Monthly revenue — last {range} months
            </p>
          </div>
          <p className="font-luxury text-2xl text-primary">
            PKR{" "}
            {derived.monthlyData
              .reduce((a, b) => a + b.revenue, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={derived.monthlyData}
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
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
                width={36}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke={GOLD}
                strokeWidth={2.5}
                dot={{ r: 4, fill: GOLD, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: GOLD }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ORDERS BAR + STATUS PIE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ORDERS BAR */}
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 lg:p-7">
          <h2 className="font-luxury text-2xl text-gray-800 mb-1">
            Orders per Month
          </h2>
          <p className="font-cormorant text-lg text-gray-500 mb-6">
            Volume trend
          </p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={derived.monthlyData}
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
                  width={24}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="orders"
                  name="orders"
                  fill={GOLD}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STATUS PIE */}
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 lg:p-7">
          <h2 className="font-luxury text-2xl text-gray-800 mb-1">
            Order Status
          </h2>
          <p className="font-cormorant text-lg text-gray-500 mb-4">
            Breakdown of all orders
          </p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={derived.statusData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {derived.statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || GOLD} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(val) => (
                    <span className="text-xs text-gray-600 capitalize">
                      {val.toLowerCase()}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── TOP PRODUCTS + CITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP PRODUCTS */}
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 lg:p-7">
          <h2 className="font-luxury text-2xl text-gray-800 mb-1">
            Top Products
          </h2>
          <p className="font-cormorant text-lg text-gray-500 mb-5">
            By revenue generated
          </p>
          {derived.topProducts.length === 0 ? (
            <p className="text-gray-300 font-cormorant text-xl text-center py-8">
              No data yet
            </p>
          ) : (
            <div className="space-y-3">
              {derived.topProducts.map((p, idx) => {
                const max = derived.topProducts[0].revenue;
                const pct = max ? Math.round((p.revenue / max) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-4">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                          {p.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          PKR {p.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">{p.qty} sold</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#f0ebe2] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: GOLD }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CITY BREAKDOWN */}
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 lg:p-7">
          <h2 className="font-luxury text-2xl text-gray-800 mb-1">
            Orders by City
          </h2>
          <p className="font-cormorant text-lg text-gray-500 mb-5">
            Top delivery locations
          </p>
          {derived.cityData.length === 0 ? (
            <p className="text-gray-300 font-cormorant text-xl text-center py-8">
              No data yet
            </p>
          ) : (
            <div className="space-y-3">
              {derived.cityData.map((c, idx) => {
                const max = derived.cityData[0].count;
                const pct = max ? Math.round((c.count / max) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-4">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-medium text-gray-800">
                          {c.city}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {c.count} order{c.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="h-1.5 bg-[#f0ebe2] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: "#8B5CF6" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── STATUS + PAYMENT SUMMARY ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const count = orders.filter((o) => o.orderStatus === status).length;
          const pct = orders.length
            ? Math.round((count / orders.length) * 100)
            : 0;
          return (
            <div
              key={status}
              className="bg-white border border-[#e7dcc7] rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <p className="text-xs text-gray-400 uppercase tracking-widest truncate">
                  {status.toLowerCase()}
                </p>
              </div>
              <p className="font-luxury text-2xl text-gray-800">{count}</p>
              <p className="text-xs text-gray-400 mt-1">{pct}%</p>
            </div>
          );
        })}
      </div>

      {/* ── PAYMENT METHOD ── */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 lg:p-7">
        <h2 className="font-luxury text-2xl text-gray-800 mb-1">
          Payment Methods
        </h2>
        <p className="font-cormorant text-lg text-gray-500 mb-5">
          How customers are paying
        </p>
        <div className="flex flex-wrap gap-4">
          {derived.paymentData.map((pm, i) => {
            const pct = orders.length
              ? Math.round((pm.value / orders.length) * 100)
              : 0;
            const colors = [GOLD, "#8B5CF6", "#3B82F6", "#10B981"];
            return (
              <div
                key={i}
                className="flex-1 min-w-[140px] border border-[#e7dcc7] rounded-2xl p-4"
              >
                <div
                  className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center"
                  style={{ background: colors[i] + "22" }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: colors[i] }}
                  />
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  {pm.name}
                </p>
                <p className="font-luxury text-2xl text-gray-800 mt-1">
                  {pm.value}
                </p>
                <p className="text-xs text-gray-400">{pct}% of orders</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── KPI CARD ── */
function KpiCard({ icon, title, value, sub, change }) {
  const isPositive = change && Number(change) >= 0;
  return (
    <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center shrink-0">
          {icon}
        </div>
        {change !== null && change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-xl ${isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-500"}`}
          >
            {isPositive ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 uppercase tracking-widest">{title}</p>
      <h3 className="font-semibold text-gray-800 text-lg leading-tight mt-1 truncate">
        {value}
      </h3>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
