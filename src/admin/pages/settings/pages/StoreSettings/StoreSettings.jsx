/* =========================================================
   STORE SETTINGS PAGE
========================================================= */

import {
  ChevronRight,
  ImagePlus,
  LayoutPanelTop,
  Images,
  Shapes,
  User2,
  Phone,
  Landmark,
  ArrowLeft,
  Truck,
  CircleHelp,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

const storeSections = [
  {
    title: "Landing Page",
    desc: "Edit landing hero image and texts",
    icon: ImagePlus,
    path: "/admin/settings/store/landing",
  },

  {
    title: "Hero Sections",
    desc: "Manage left & right promotional sections",
    icon: LayoutPanelTop,
    path: "/admin/settings/store/hero",
  },

  {
    title: "Homepage Slider",
    desc: "Manage promotional homepage slides",
    icon: Images,
    path: "/admin/settings/store/slider",
  },

  {
    title: "Owner Details",
    desc: "Update owner image and information",
    icon: User2,
    path: "/admin/settings/store/owner",
  },

  {
    title: "Contact Details",
    desc: "Manage phone number and email",
    icon: Phone,
    path: "/admin/settings/store/contact",
  },

  {
    title: "Bank Information",
    desc: "Manage payment and WhatsApp details",
    icon: Landmark,
    path: "/admin/settings/store/bank",
  },
  {
    title: "Shipping Settings",
    desc: "Free shipping & delivery controls",
    icon: Truck,
    path: "/admin/settings/store/shipping",
  },

  {
    title: "FAQ Management",
    desc: "Manage customer FAQs",
    icon: CircleHelp,
    path: "/admin/settings/store/faqs",
  },
];

const StoreSettings = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl border border-[#e7dcc7] bg-white flex items-center justify-center hover:bg-[#faf7f2] transition"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="font-luxury text-3xl lg:text-5xl text-gray-800">
            My Store
          </h1>
          <p className="font-cormorant text-lg text-gray-500 mt-1">
            Customize your luxury storefront experience
          </p>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white border border-[#e7dcc7] rounded-[32px] overflow-hidden">
        {storeSections.map((item, index) => {
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
                ${index !== storeSections.length - 1 && "border-b border-[#eee2cc]"}
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

export default StoreSettings;
