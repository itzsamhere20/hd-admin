import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Mars,
  Venus,
  Package,
  ArrowLeft,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  Tag,
  Layers,
} from "lucide-react";
import api from "../../../api/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
/* =========================
   STAT CARD  (matches Orders)
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
   DELETE MODAL  (matches Orders style)
========================= */
function DeleteModal({ onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h2 className="font-luxury text-2xl text-gray-800">Delete Product?</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          This product will be permanently deleted. This cannot be undone.
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
   PRODUCT CARD  (new card grid, matches Orders card style)
========================= */
function ProductCard({ product, onEdit, onDelete }) {
  const inStock = Number(product.stock) > 0;
  const lowStock = Number(product.stock) > 0 && Number(product.stock) < 5;
  const discountedPrice = Math.round(
    product.price - (product.price * (product.discount || 0)) / 100,
  );

  const stockCfg = inStock
    ? lowStock
      ? {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          dot: "bg-amber-400",
          label: "Low Stock",
        }
      : {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          dot: "bg-emerald-400",
          label: "In Stock",
        }
    : {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
        dot: "bg-red-400",
        label: "Out of Stock",
      };

  return (
    <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* TOP ROW */}
      <div className="flex items-start gap-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-20 h-20 rounded-2xl object-contain border border-[#e7dcc7] shrink-0 bg-[#faf7f2]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-semibold text-gray-800 text-[15px] capitalize truncate leading-tight">
              {product.name}
            </h2>
            <button
              onClick={() => onDelete(product._id)}
              className="w-7 h-7 rounded-xl border border-[#e7dcc7] flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors shrink-0"
            >
              <Trash2 size={13} className="text-gray-400 hover:text-red-500" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            ID: #{product._id?.slice(-5)}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{product.category}</p>
          {/* Status pill */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border mt-2 ${stockCfg.bg} ${stockCfg.text} ${stockCfg.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${stockCfg.dot}`} />
            {stockCfg.label}
          </span>
        </div>
      </div>

      {/* TAGS ROW */}
      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1 rounded-xl bg-[#faf7f2] border border-[#e7dcc7] text-xs text-gray-600 capitalize">
          {product.type}
        </span>
        <span
          className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 ${
            product.gender === "male"
              ? "bg-blue-50 border border-blue-100 text-blue-600"
              : "bg-pink-50 border border-pink-100 text-pink-600"
          }`}
        >
          {product.gender === "male" ? <Mars size={11} /> : <Venus size={11} />}
          {product.gender === "male" ? "Men" : "Women"}
        </span>
        {product.discount > 0 && (
          <span className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            {product.discount}% OFF
          </span>
        )}
        {product.sizes?.length > 0 && (
          <span className="px-2.5 py-1 rounded-xl bg-[#faf7f2] border border-[#e7dcc7] text-xs text-gray-500">
            {product.sizes.length} size{product.sizes.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* PRICE + STOCK */}
      <div className="flex items-center justify-between border-t border-[#f0ebe2] pt-3">
        <div>
          {product.discount > 0 && (
            <p className="text-xs text-gray-400 line-through leading-none">
              PKR {Number(product.price).toLocaleString()}
            </p>
          )}
          <p className="font-semibold text-gray-800">
            PKR {Number(discountedPrice).toLocaleString()}
          </p>
        </div>
        <span className="text-sm text-gray-500">
          Stock:{" "}
          <span className="font-medium text-gray-700">{product.stock}</span>
        </span>
      </div>

      {/* EDIT BUTTON */}
      <button
        onClick={() => onEdit(product)}
        className="flex items-center justify-center gap-1.5 text-sm bg-black text-white px-4 py-2.5 rounded-2xl hover:opacity-80 transition-opacity w-full"
      >
        <Pencil size={14} />
        Edit Product
      </button>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [DuplicateError, setDuplicateError] = useState("");
  const [sort, setSort] = useState("All Products");
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    image: "",
    imageFile: null,
    imagePreview: "",
    public_id: "",
    gender: "female",
    sizes: [],
    discount: "",
    type: "silver",
    material: "",
    care: "",
    stone: "",
  });

  // ================= FETCH =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCategories();

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await api.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // ================= ADD / UPDATE =================
  const handleAddProduct = async () => {
    if (!validateForm()) return;
    if (editingProduct && !hasChanges) {
      setDuplicateError("No changes detected");
      return;
    }
    try {
      if (
        !formData.name ||
        !formData.price ||
        !formData.category ||
        !formData.stock ||
        !formData.description ||
        (!formData.image && !formData.imageFile) ||
        !formData.gender
      ) {
        toast.error("All fields are required");
        return;
      }
      setSaving(true);
      const token = localStorage.getItem("token");

      if (editingProduct) {
        let uploaded = null;
        if (formData.imageFile)
          uploaded = await uploadImage(formData.imageFile);
        const res = await api.put(
          `/products/${editingProduct._id}`,
          {
            ...formData,
            image: uploaded?.url || formData.image,
            public_id: uploaded?.public_id || formData.public_id,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? res.data : p)),
        );
        setEditingProduct(null);
        toast.success("Product updated successfully");
      } else {
        let uploaded = null;
        if (formData.imageFile)
          uploaded = await uploadImage(formData.imageFile);
        const res = await api.post("/products", {
          ...formData,
          image: uploaded?.url,
          public_id: uploaded?.public_id,
        });
        setProducts((prev) => [res.data, ...prev]);
        toast.success("Product added successfully");
      }

      setDrawerOpen(false);
      setFormData({
        name: "",
        price: "",
        category: "",
        stock: "",
        description: "",
        image: "",
        gender: "female",
        sizes: [],
        discount: "",
        type: "silver",
        material: "",
        care: "",
        stone: "",
      });
    } catch (err) {
      setDuplicateError(err?.response?.data?.message || "Something went wrong");
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      const product = products.find((p) => p._id === productToDelete);
      await api.delete(`/products/${productToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { public_id: product?.public_id },
      });
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete));
      toast.success("Product deleted successfully");
      setDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.log(err);
    } finally {
      setDeleting(false);
    }
  };

  // ================= IMAGE UPLOAD =================
  const uploadImage = async (file) => {
    const form = new FormData();
    form.append("image", file);
    const token = localStorage.getItem("token");
    const res = await api.post("/upload", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { url: res.data.url, public_id: res.data.public_id };
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.stock) newErrors.stock = "Stock is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.image && !formData.imageFile)
      newErrors.image = "Product image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ================= FILTER =================
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.category?.toLowerCase().includes(search.toLowerCase()) ||
      product._id?.toLowerCase().includes(search.toLowerCase());

    let matchesSort = true;
    if (sort === "Out of Stock") matchesSort = Number(product.stock) === 0;
    if (sort === "Low Stock") matchesSort = Number(product.stock) < 5;
    if (sort === "Artificial") matchesSort = product.type === "artificial";
    if (sort === "Gold") matchesSort = product.type === "gold";
    if (sort === "Silver") matchesSort = product.type === "silver";
    if (sort === "Mens") matchesSort = product.gender === "male";
    if (sort === "Women") matchesSort = product.gender === "female";

    const categoryNames = categories.map((cat) => cat.name);
    if (categoryNames.includes(sort)) matchesSort = product.category === sort;

    return matchesSearch && matchesSort;
  });

  // ================= ANALYTICS =================
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => Number(p.stock) > 0).length;
  const outOfStockCount = products.filter((p) => Number(p.stock) === 0).length;

  // ================= CHANGE DETECTION =================
  const normalize = (p) => ({
    name: p.name?.trim(),
    price: Number(p.price),
    category: p.category,
    stock: Number(p.stock),
    description: p.description?.trim(),
    image: p.image,
    gender: p.gender,
    discount: Number(p.discount || 0),
    type: p.type || "silver",
    sizes: JSON.stringify(p.sizes || []),
    material: p.material,
    care: p.care,
    stone: p.stone,
  });

  const hasChanges =
    editingProduct &&
    (JSON.stringify(normalize(formData)) !==
      JSON.stringify(normalize(editingProduct)) ||
      formData.imageFile !== null);

  // ================= LOADING =================
  if (loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="font-cormorant text-xl text-gray-500 tracking-widest">
            Loading Products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-1">
          <button
            onClick={() => navigate("/admin/products")}
            className="w-11 h-11 rounded-2xl border border-[#e7dcc7] bg-white flex items-center justify-center hover:bg-[#faf7f2] transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-luxury text-4xl lg:text-5xl text-gray-800 tracking-tight">
              Products
            </h1>
            <p className="font-cormorant text-xl text-gray-500 mt-1">
              Manage your jewelry collection
            </p>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Package size={20} />}
          title="Total Products"
          value={totalProducts}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="In Stock"
          value={inStockCount}
          sub={`of ${totalProducts} products`}
        />
        <StatCard
          icon={<Layers size={20} />}
          title="Out of Stock"
          value={outOfStockCount}
          sub="need restocking"
        />
      </div>

      {/* CONTROLS */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* SEARCH */}
          <div className="flex items-center gap-3 border border-[#e7dcc7] rounded-2xl px-4 py-3 flex-1">
            <Search size={17} className="text-gray-400 shrink-0" />
            <input
              className="w-full outline-none bg-transparent text-sm placeholder:text-gray-400"
              placeholder="Search by name, category or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={15} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* SORT */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none border border-[#e7dcc7] rounded-2xl px-4 py-3 pr-10 bg-white outline-none text-sm w-full lg:w-[220px]"
            >
              <option>All Products</option>
              <option>Out of Stock</option>
              <option>Low Stock</option>
              <option>Gold</option>
              <option>Silver</option>
              <option>Artificial</option>
              <option>Mens</option>
              <option>Women</option>
              {categories.map((cat) => (
                <option key={cat._id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() => {
              setEditingProduct(null);
              setDrawerOpen(true);
            }}
            className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition whitespace-nowrap"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* RESULTS COUNT */}
      <p className="text-sm text-gray-400 mb-4 px-1">
        Showing{" "}
        <span className="text-gray-700 font-medium">
          {filteredProducts.length}
        </span>{" "}
        product{filteredProducts.length !== 1 ? "s" : ""}
      </p>

      {/* PRODUCT GRID */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-14 text-center">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-cormorant text-2xl text-gray-400">
            No products found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={(product) => {
                setEditingProduct(product);
                setFormData({
                  name: product.name,
                  price: product.price,
                  category: product.category,
                  stock: product.stock,
                  description: product.description,
                  image: product.image,
                  gender: product.gender || "female",
                  sizes: product.sizes || [],
                  discount: product.discount || "",
                  type: product.type || "silver",
                  stone: product.stone || "",
                  material: product.material || "",
                  care: product.care || "",
                  imageFile: null,
                  imagePreview: "",
                  public_id: product.public_id || "",
                });
                setDrawerOpen(true);
              }}
              onDelete={(id) => {
                setDeleteModal(true);
                setProductToDelete(id);
              }}
            />
          ))}
        </div>
      )}
      <AnimatePresence>
        {/* RIGHT DRAWER */}
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/30 flex justify-end"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-3/4 sm:w-[420px] h-full bg-white shadow-2xl  overflow-y-auto"
            >
              {/* DRAWER HEADER */}
              <div className="sticky top-0 bg-white border-b p-6 border-[#f0ebe2] pb-4 mb-2 flex items-center justify-between">
                <div>
                  <h2 className="font-luxury text-2xl text-gray-800 flex items-center gap-2">
                    <Package size={20} />
                    {editingProduct ? "Edit Product" : "Add Product"}
                  </h2>
                  <p className="text-sm text-gray-400 font-cormorant mt-0.5">
                    {editingProduct
                      ? "Update product details"
                      : "Create a new jewelry product"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setDuplicateError(null);
                    if (editingProduct) {
                      setFormData({
                        name: "",
                        price: "",
                        category: "",
                        stock: "",
                        description: "",
                        image: "",
                        imageFile: null,
                        imagePreview: "",
                        public_id: "",
                        gender: "female",
                        sizes: [],
                        discount: "",
                        type: "silver",
                        material: "",
                        care: "",
                        stone: "",
                      });
                    }
                  }}
                  className="w-9 h-9 rounded-2xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* FORM */}
              <div className="space-y-5 p-6">
                {/* IMAGE */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Product Image*</p>
                  <label className="h-[180px] border-2 border-dashed border-[#e7dcc7] rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#faf7f2] transition overflow-hidden">
                    {formData.imagePreview || formData.image ? (
                      <img
                        src={formData.imagePreview || formData.image}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <>
                        <Upload size={28} className="text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">
                          Upload Product Image
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setFormData((prev) => ({
                          ...prev,
                          imageFile: file,
                          imagePreview: URL.createObjectURL(file),
                        }));
                        clearError("image");
                      }}
                    />
                    {errors.image && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.image}
                      </p>
                    )}
                  </label>
                </div>

                {/* NAME */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Product Name*</p>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      clearError("name");
                      setDuplicateError("");
                      setFormData({ ...formData, name: e.target.value });
                    }}
                    className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2]"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                  )}
                </div>

                {/* PRICE */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Price*</p>
                  <input
                    type="text"
                    value={
                      formData.price
                        ? Number(formData.price).toLocaleString()
                        : ""
                    }
                    onChange={(e) => {
                      clearError("price");
                      const rawValue = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(rawValue)) {
                        setFormData({ ...formData, price: rawValue });
                      }
                    }}
                    className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2]"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-2">{errors.price}</p>
                  )}
                </div>

                {/* CATEGORY */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Category*</p>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      clearError("category");
                      setFormData({ ...formData, category: e.target.value });
                    }}
                    className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* STOCK */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Stock*</p>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => {
                      clearError("stock");
                      setFormData({
                        ...formData,
                        stock: e.target.value === "" ? "" : e.target.value,
                      });
                    }}
                    className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2]"
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-sm mt-2">{errors.stock}</p>
                  )}
                </div>

                {/* DISCOUNT */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Discount %{" "}
                    <span className="text-gray-400 ml-1">(Optional)</span>
                  </p>
                  <input
                    type="number"
                    placeholder="10"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setFormData({ ...formData, discount: "" });
                        return;
                      }
                      const num = Number(value);
                      if (num >= 0 && num <= 100)
                        setFormData({ ...formData, discount: num });
                    }}
                    className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2]"
                  />
                </div>

                {/* SIZES */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Add Sizes</p>
                  <input
                    type="text"
                    placeholder="16mm,17mm,19mm"
                    defaultValue={formData.sizes.join(",")}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        sizes: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s !== ""),
                      });
                    }}
                    className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2]"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.sizes.map((size, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 rounded-xl bg-[#faf7f2] border border-[#e7dcc7] text-sm text-gray-700"
                      >
                        {size}
                      </div>
                    ))}
                  </div>
                </div>

                {/* GENDER */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Gender</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, gender: "male" })
                      }
                      className={`flex-1 h-[52px] rounded-2xl border flex items-center justify-center transition ${
                        formData.gender === "male"
                          ? "bg-blue-500 text-white border-blue-500 shadow-md"
                          : "border-[#e7dcc7] bg-white text-gray-600"
                      }`}
                    >
                      <Mars size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, gender: "female" })
                      }
                      className={`flex-1 h-[52px] rounded-2xl border flex items-center justify-center transition ${
                        formData.gender === "female"
                          ? "bg-pink-500 text-white border-pink-500 shadow-md"
                          : "border-[#e7dcc7] bg-white text-gray-600"
                      }`}
                    >
                      <Venus size={22} />
                    </button>
                  </div>
                </div>

                {/* TYPE */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Product Type</p>
                  <div className="flex gap-3">
                    {["gold", "silver", "artificial"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`flex-1 h-[50px] rounded-2xl border capitalize transition ${
                          formData.type === type
                            ? "bg-black text-white border-black shadow-md"
                            : "border-[#e7dcc7] bg-white"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* STONE */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Stone</p>
                  <input
                    type="text"
                    value={formData.stone}
                    onChange={(e) =>
                      setFormData({ ...formData, stone: e.target.value })
                    }
                    className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2]"
                  />
                </div>

                {/* MATERIAL */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Material</p>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) =>
                      setFormData({ ...formData, material: e.target.value })
                    }
                    className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2]"
                  />
                </div>

                {/* CARE */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Care</p>
                  <input
                    type="text"
                    value={formData.care}
                    onChange={(e) =>
                      setFormData({ ...formData, care: e.target.value })
                    }
                    className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2]"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Description*</p>
                  <textarea
                    rows="5"
                    value={formData.description}
                    onChange={(e) => {
                      clearError("description");
                      setFormData({ ...formData, description: e.target.value });
                    }}
                    className="w-full border border-[#e7dcc7] rounded-2xl p-4 outline-none bg-[#faf7f2] resize-none"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.description}
                    </p>
                  )}
                </div>

                {DuplicateError && (
                  <p className="text-red-500 text-sm mt-2">{DuplicateError}</p>
                )}
                {editingProduct && !hasChanges && (
                  <p className="text-xs text-red-500 mt-2">
                    No changes to update
                  </p>
                )}

                {/* BUTTONS */}
                <div className="flex gap-3 pt-4">
                  <button
                    disabled={saving}
                    onClick={() => {
                      setDrawerOpen(false);
                      setDuplicateError(null);
                      if (editingProduct) {
                        setFormData({
                          name: "",
                          price: "",
                          category: "",
                          stock: "",
                          description: "",
                          image: "",
                          gender: "female",
                          sizes: [],
                          discount: 0,
                          type: "silver",
                          material: "",
                          care: "",
                        });
                      }
                    }}
                    className="flex-1 h-[50px] rounded-2xl border border-[#e7dcc7] text-gray-700 hover:bg-[#faf7f2] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProduct}
                    disabled={saving || (editingProduct && !hasChanges)}
                    className="flex-1 h-[50px] rounded-2xl bg-primary text-white disabled:opacity-50 hover:opacity-90 transition"
                  >
                    {saving
                      ? editingProduct
                        ? "Updating..."
                        : "Saving..."
                      : editingProduct
                        ? "Update Product"
                        : "Save Product"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      {deleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteModal(false);
            setProductToDelete(null);
          }}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default Products;
