import { Package, Layers3, ChevronRight } from "lucide-react";

import { Link } from "react-router-dom";

const productItems = [
  {
    title: "Products",
    desc: "Add, update, delete and manage products",
    icon: Package,
    path: "/admin/products/list",
  },
  {
    title: "Categories",
    desc: "Add, update and delete categories",
    icon: Layers3,
    path: "/admin/products/categories",
  },
];

const ProductHome = () => {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="font-luxury text-3xl lg:text-5xl text-gray-800">
          Products
        </h1>

        <p className="font-cormorant text-lg text-gray-500 mt-2">
          Manage products and categories
        </p>
      </div>

      {/* LIST */}
      <div className="bg-white border border-[#e7dcc7] rounded-[32px] overflow-hidden">
        {productItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              to={item.path}
              className={`
                flex items-center justify-between
                p-5 lg:p-6
                hover:bg-[#faf7f2]
                transition
                ${
                  index !== productItems.length - 1 &&
                  "border-b border-[#eee2cc]"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#faf7f2] flex items-center justify-center">
                  <Icon className="text-primary" size={22} />
                </div>

                <div>
                  <h2 className="font-cormorant text-xl text-gray-800">
                    {item.title}
                  </h2>

                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>

              <ChevronRight className="text-gray-400" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductHome;
