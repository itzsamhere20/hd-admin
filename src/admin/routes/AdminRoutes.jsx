import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Orders from "../pages/Orders";

import Customers from "../pages/Customers";
import Analytics from "../pages/Analytics";
import Settings from "../pages/settings/Settings";
// Products Routes
import ProductHome from "../pages/products/ProductHome";
import Products from "../pages/products/pages/Products";
import Categories from "../pages/products/pages/Categories";

// settings sub-pages
import SecuritySettings from "../pages/settings/pages/SecuritySettings";
import ProfileSettings from "../pages/settings/pages/ProfileSettings";
import StoreSettings from "../pages/settings/pages/StoreSettings/StoreSettings";
import ShippingSettings from "../pages/settings/pages/ShippingSettings";
import PromoSettings from "../pages/settings/pages/PromoSettings";
import FAQSettings from "../pages/settings/pages/FAQSettings";

//       store setting  pages----------
import LandingSettings from "../pages/settings/pages/StoreSettings/pages/LandingSettings";
import HeroSettings from "../pages/settings/pages/StoreSettings/pages/HeroSettings";
import HomepageCategoriesSettings from "../pages/settings/pages/StoreSettings/pages/CategoriesSetting";
import SliderSettings from "../pages/settings/pages/StoreSettings/pages/SliderSettings";
import ContactSettings from "../pages/settings/pages/StoreSettings/pages/ContactSettings";
import OwnerSettings from "../pages/settings/pages/StoreSettings/pages/OwnerSettings";
import BankSettings from "../pages/settings/pages/StoreSettings/pages/BankSettings";

import { Toaster } from "react-hot-toast";
const AdminRoutes = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* default dashboard */}
          <Route index element={<Dashboard />} />

          <Route path="orders" element={<Orders />} />

          <Route path="customers" element={<Customers />} />
          <Route path="analytics" element={<Analytics />} />

          {/* --------- Product Page Route s-------- */}
          <Route path="products" element={<ProductHome />} />
          <Route path="products/list" element={<Products />} />
          <Route path="products/categories" element={<Categories />} />

          {/* ------------setting page royutes--------------- */}
          <Route path="settings" element={<Settings />} />

          <Route path="settings/security" element={<SecuritySettings />} />

          <Route path="settings/profile" element={<ProfileSettings />} />

          <Route path="settings/store" element={<StoreSettings />} />

          <Route path="settings/shipping" element={<ShippingSettings />} />

          <Route path="settings/promos" element={<PromoSettings />} />

          <Route path="settings/faqs" element={<FAQSettings />} />

          {/* ----------------------- Store settings pages----------------------- */}
          <Route path="settings/store/landing" element={<LandingSettings />} />

          <Route path="settings/store/hero" element={<HeroSettings />} />

          <Route
            path="settings/store/categories"
            element={<HomepageCategoriesSettings />}
          />

          <Route path="settings/store/slider" element={<SliderSettings />} />

          <Route path="settings/store/contact" element={<ContactSettings />} />

          <Route path="settings/store/owner" element={<OwnerSettings />} />

          <Route path="settings/store/bank" element={<BankSettings />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
};

export default AdminRoutes;
