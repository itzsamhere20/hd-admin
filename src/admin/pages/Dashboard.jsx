import { ShoppingBag, DollarSign, Package, Users } from "lucide-react";

import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";

const stats = [
  {
    title: "Total Orders",
    value: "1,248",
    icon: ShoppingBag,
  },
  {
    title: "Revenue",
    value: "$24,780",
    icon: DollarSign,
  },
  {
    title: "Products",
    value: "186",
    icon: Package,
  },
  {
    title: "Customers",
    value: "892",
    icon: Users,
  },
];

const salesData = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4500 },
  { month: "May", sales: 6200 },
  { month: "Jun", sales: 5800 },
];

const recentOrders = [
  {
    id: "#1024",
    customer: "Ayesha Khan",
    product: "Silver Ring",
    amount: "$120",
    status: "Delivered",
  },
  {
    id: "#1025",
    customer: "Sara Ali",
    product: "Necklace Set",
    amount: "$240",
    status: "Pending",
  },
  {
    id: "#1026",
    customer: "Hina Noor",
    product: "Bracelet",
    amount: "$90",
    status: "Cancelled",
  },
  {
    id: "#1027",
    customer: "Fatima Ahmed",
    product: "Earrings",
    amount: "$75",
    status: "Delivered",
  },
];

const Dashboard = () => {
  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="font-luxury text-3xl sm:text-4xl lg:text-5xl text-gray-800">
          Dashboard
        </h1>

        <p className="font-cormorant text-lg sm:text-xl text-gray-600 mt-2">
          Welcome back to Hamdam Collections Admin Panel.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="
                bg-white
                border border-[#e7dcc7]
                rounded-3xl
                p-5 lg:p-6
                shadow-sm
                hover:shadow-md
                transition
              "
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-gray-500 font-cormorant text-lg">
                    {item.title}
                  </p>

                  <h2 className="text-2xl lg:text-3xl font-semibold mt-2 text-gray-800 truncate">
                    {item.value}
                  </h2>
                </div>

                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#faf7f2] flex items-center justify-center shrink-0">
                  <Icon className="text-primary" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <div
        className="
          mt-8 lg:mt-10
          bg-white
          border border-[#e7dcc7]
          rounded-3xl
          p-4 sm:p-6
        "
      >
        <div className="mb-6">
          <h2 className="font-luxury text-2xl lg:text-3xl text-gray-800">
            Sales Analytics
          </h2>

          <p className="font-cormorant text-lg lg:text-xl text-gray-500 mt-1">
            Monthly revenue overview
          </p>
        </div>

        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="sales"
                stroke="#A68A3C"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MOBILE ORDERS CARDS */}
      <div className="lg:hidden mt-8 space-y-4">
        <div>
          <h2 className="font-luxury text-2xl text-gray-800">Recent Orders</h2>

          <p className="font-cormorant text-lg text-gray-500 mt-1">
            Latest customer purchases
          </p>
        </div>

        {recentOrders.map((order, index) => (
          <div
            key={index}
            className="
              bg-white
              border border-[#e7dcc7]
              rounded-3xl
              p-4
            "
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">{order.customer}</h3>

              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }
                `}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <p>Order ID: {order.id}</p>
              <p>Product: {order.product}</p>
              <p className="font-medium text-gray-800">
                Amount: {order.amount}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP ORDERS TABLE */}
      <div
        className="
          hidden lg:block
          mt-10
          bg-white
          border border-[#e7dcc7]
          rounded-3xl
          p-6
          overflow-x-auto
        "
      >
        {/* Heading */}
        <div className="mb-6">
          <h2 className="font-luxury text-3xl text-gray-800">Recent Orders</h2>

          <p className="font-cormorant text-xl text-gray-500 mt-1">
            Latest customer purchases
          </p>
        </div>

        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#e7dcc7]">
              <th className="text-left py-4 font-cormorant text-xl text-gray-500">
                Order ID
              </th>

              <th className="text-left py-4 font-cormorant text-xl text-gray-500">
                Customer
              </th>

              <th className="text-left py-4 font-cormorant text-xl text-gray-500">
                Product
              </th>

              <th className="text-left py-4 font-cormorant text-xl text-gray-500">
                Amount
              </th>

              <th className="text-left py-4 font-cormorant text-xl text-gray-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {recentOrders.map((order, index) => (
              <tr
                key={index}
                className="
                  border-b border-[#f1eadf]
                  hover:bg-[#faf7f2]
                  transition
                "
              >
                <td className="py-5 text-gray-700">{order.id}</td>

                <td className="py-5 text-gray-700">{order.customer}</td>

                <td className="py-5 text-gray-700">{order.product}</td>

                <td className="py-5 font-medium text-gray-800">
                  {order.amount}
                </td>

                <td className="py-5">
                  <span
                    className={`
                      px-4 py-1 rounded-full text-sm font-medium
                      ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
