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
  Stone,
} from "lucide-react";
import api from "../../../api/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  // SEARCH + FILTER
  const [search, setSearch] = useState("");

  // DRAWER
  const [drawerOpen, setDrawerOpen] = useState(false);

  // LOADING
  const [saving, setSaving] = useState(false);

  // EDITING
  const [editingProduct, setEditingProduct] = useState(null);

  // DELETE MODAL
  const [deleteModal, setDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [DuplicateError, setDuplicateError] = useState("");
  const [sort, setSort] = useState("All Products");
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // FORM
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

  // ================= FETCH PRODUCTS And CATEGORIES =================
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

  // ================= ADD / UPDATE PRODUCT =================
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

      // UPDATE PRODUCT
      if (editingProduct) {
        let uploaded = null;

        // 👇 IMPORTANT FIX: upload new image if selected
        if (formData.imageFile) {
          uploaded = await uploadImage(formData.imageFile);
        }

        const res = await api.put(
          `/products/${editingProduct._id}`,
          {
            ...formData,
            image: uploaded?.url || formData.image, // 👈 fallback to old image
            public_id: uploaded?.public_id || formData.public_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? res.data : p)),
        );

        setEditingProduct(null);
        toast.success("Product updated successfully");
      }

      // ADD PRODUCT
      else {
        let uploaded = null;

        if (formData.imageFile) {
          uploaded = await uploadImage(formData.imageFile);
        }
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

  // ================= DELETE PRODUCT =================
  const handleDelete = async () => {
    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      const product = products.find((p) => p._id === productToDelete);

      await api.delete(`/products/${productToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          public_id: product?.public_id,
        },
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      url: res.data.url,
      public_id: res.data.public_id,
    };
  };
  // --------------------- empty  field checker----------
  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.stock) {
      newErrors.stock = "Stock is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.image && !formData.imageFile) {
      newErrors.image = "Product image is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ================= FILTERED PRODUCTS =================
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.category?.toLowerCase().includes(search.toLowerCase()) ||
      product._id?.toLowerCase().includes(search.toLowerCase());

    let matchesSort = true;

    // SORT FILTER
    if (sort === "Out of Stock") {
      matchesSort = Number(product.stock) === 0;
    }

    if (sort === "Low Stock") {
      matchesSort = Number(product.stock) < 5;
    }

    if (sort === "Artificial") {
      matchesSort = product.type === "artificial";
    }

    if (sort === "Gold") {
      matchesSort = product.type === "gold";
    }
    if (sort === "Silver") {
      matchesSort = product.type === "silver";
    }

    if (sort === "Mens") {
      matchesSort = product.gender === "male";
    }

    if (sort === "Women") {
      matchesSort = product.gender === "female";
    }

    const categoryNames = categories.map((cat) => cat.name);

    if (categoryNames.includes(sort)) {
      matchesSort = product.category === sort;
    }

    return matchesSearch && matchesSort;
  });
  // ------------checks weather product updated ornot -----
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

  // ---error clearer function-----
  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };
  /* LOADING */
  if (loadingProducts) {
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
    <div className="relative  w-full  overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate("/admin/products")}
            className="
        w-11 h-11
        rounded-2xl
        border border-[#e7dcc7]
        bg-white
        flex items-center justify-center
        hover:bg-[#faf7f2]
        transition
      "
          >
            <ArrowLeft size={20} />
          </button>

          {/* TITLE */}
          <div>
            <h1 className="font-luxury text-4xl lg:text-5xl text-gray-800">
              Products
            </h1>

            <p className="font-cormorant text-xl text-gray-500 mt-1">
              Manage your jewelry collection
            </p>
          </div>
        </div>

        {/* ADD PRODUCT */}
        <button
          onClick={() => {
            setEditingProduct(null);
            setDrawerOpen(true);
          }}
          className=" bg-primary text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition w-full lg:w-auto "
        >
          {" "}
          <Plus size={20} /> Add Product{" "}
        </button>
      </div>
      {/* FILTERS */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* SEARCH */}
          <div className="flex items-center gap-3 border border-[#e7dcc7] rounded-2xl px-4 py-3 flex-1">
            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none bg-transparent"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="
    border border-[#e7dcc7]
    rounded-2xl px-4 py-3
    bg-white outline-none
    w-full lg:w-[220px]
  "
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
        </div>
      </div>
      {/* MOBILE CARDS */}
      <div className="2xl:hidden space-y-4 w-full overflow-x-hidden ">
        {/* ---------skeleton cards-----------*/}
        {filteredProducts.length === 0 ? (
          //  -----------mobile cards------------
          <div
            className="
      bg-white
      border border-[#e7dcc7]
      rounded-3xl
      p-10
      text-center
    "
          >
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="
              bg-white
              border border-[#e7dcc7]
              rounded-3xl
              w-full
              overflow-hidden
              p-4
            "
            >
              {/* --------------name and image and discount------------ */}
              <div className="flex gap-4 min-w-0 w-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 rounded-2xl object-contain"
                />

                <div className="flex-1 w-full min-w-0 overflow-hidden">
                  <div className="flex items-start gap-2 w-full min-w-0 ">
                    <h3 className="font-medium text-lg text-gray-800  truncate  capitalize min-w-0 flex-1">
                      {product.name}
                    </h3>
                    {/* --------discount------ */}
                    {product.discount > 0 && (
                      <p className="text-xs bg-primary/20 px-2 py-1 rounded text-primary break-words">
                        {product.discount}% OFF
                      </p>
                    )}
                  </div>
                  {/* --------------------category------------- */}
                  <div className="mt-1 space-y-1">
                    <p className="text-gray-500 text-sm">{product.category}</p>
                    {/* -----------gender and Type---------- */}
                    <div className="flex items-center   gap-5 flex-wrap">
                      {/* -----------------type---------- */}

                      <span
                        className="
    px-2 py-1 rounded-md
    text-xs border capitalize
    bg-[#faf7f2]
    border-[#e7dcc7]
    text-gray-700
  "
                      >
                        {product.type}
                      </span>
                      {/* -------------gender------ */}
                      <span
                        className={`
          ${product.gender === "male" ? "text-blue-500" : "text-pink-500"} 
`}
                      >
                        {product.gender === "male" ? (
                          <Mars size={22} />
                        ) : (
                          <Venus size={22} />
                        )}
                      </span>
                    </div>

                    {/* -----------------sizes ----------------- */}
                    {product.sizes?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {product.sizes.map((size, index) => (
                          <span
                            key={index}
                            className="
            px-2 py-[3px]
            rounded-md
            bg-[#faf7f2]
            border border-[#e7dcc7]
            text-[11px] text-gray-600
          "
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* ----------discounted price------------ */}
                  <p className="text-primary font-semibold mt-2">
                    {product.discount > 0 && (
                      <span className="line-through text-gray-500 mr-2">
                        PKR {Number(product.price).toLocaleString()}
                      </span>
                    )}
                    PKR{" "}
                    {Number(
                      Math.round(
                        product.price -
                          (product.price * product.discount) / 100,
                      ),
                    ).toLocaleString()}
                  </p>
                  {/* ----------------stock------------- */}
                  <div className="mt-2">
                    <span
                      className={`
                      px-3 py-1 rounded-md text-xs font-medium
                      ${product.stock > 0 ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}
                    `}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">Stock: {product.stock}</p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
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
                      });

                      setDrawerOpen(true);
                    }}
                    className="
                    w-10 h-10 rounded-xl
                    bg-[#faf7f2]
                    flex items-center justify-center
                    hover:bg-[#f3ecdf]
                    transition
                  "
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => {
                      setDeleteModal(true);
                      setProductToDelete(product._id);
                    }}
                    className="
                    w-10 h-10 rounded-xl
                    bg-red-50 text-red-600
                    flex items-center justify-center
                    hover:bg-red-100
                    transition
                  "
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div
        className="
          hidden 2xl:block
          bg-white
          max-w-full
          border border-[#e7dcc7]
          rounded-3xl
          overflow-x-hidden
        "
      >
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#e7dcc7]">
              <th className="text-left py-5 px-6 font-cormorant text-xl text-gray-500">
                Product
              </th>

              <th className="text-left py-5 font-cormorant text-xl text-gray-500">
                Category
              </th>

              <th className="text-left py-5 font-cormorant text-xl text-gray-500">
                Price
              </th>

              <th className="text-left py-5 font-cormorant text-xl text-gray-500">
                Stock
              </th>

              <th className="text-left py-5 font-cormorant text-xl text-gray-500">
                Gender
              </th>

              <th className="text-left py-5 font-cormorant text-xl text-gray-500">
                Sizes
              </th>

              <th className="text-left py-5 font-cormorant text-xl text-gray-500">
                Discount
              </th>
              <th className="text-left py-5 font-cormorant text-xl text-gray-500">
                Type
              </th>

              <th className="text-left py-5 font-cormorant text-xl text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-10 text-gray-500 text-xl"
                >
                  No product found
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-10 text-gray-500   text-xl"
                >
                  No product found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="
                  border-b border-[#f5efe4]
                  hover:bg-[#faf7f2]
                  transition
                "
                >
                  {/* PRODUCT */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-2xl object-contain"
                      />

                      <div>
                        <h3 className="font-medium text-gray-800 capitalize">
                          {product.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          ID: #{product._id.slice(-5)}
                        </p>
                        <p
                          className={` w-max rounded-md text-sm font-medium px-2 py-1 ${product.stock > 0 ? "bg-green-100" : "bg-red-100"}  ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}{" "}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td className="text-gray-700">{product.category}</td>

                  {/* PRICE */}
                  <td className="font-medium text-gray-800 self-center">
                    {product.discount > 0 ? (
                      <del className="text-gray-400 font-normal">
                        PKR {Number(product.price).toLocaleString()}
                        <br />
                      </del>
                    ) : (
                      ""
                    )}
                    PKR{" "}
                    {Number(
                      Math.round(
                        product.price -
                          (product.price * product.discount) / 100,
                      ),
                    ).toLocaleString()}
                  </td>

                  {/* STOCK */}
                  <td className="text-gray-700">{product.stock}</td>
                  {/* GENDER */}
                  <td>
                    <span
                      className={`
      
      
    
      ${product.gender === "male" ? "text-blue-500" : "text-pink-500"}  
    `}
                    >
                      {product.gender === "male" ? (
                        <Mars size={22} />
                      ) : (
                        <Venus size={22} />
                      )}
                    </span>
                  </td>

                  {/* SIZES */}
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {product.sizes?.length > 0 ? (
                        product.sizes.map((size, index) => (
                          <span
                            key={index}
                            className="
            px-2 py-1 rounded-md
            bg-[#faf7f2]
            border border-[#e7dcc7]
            text-xs text-gray-600
          "
                          >
                            {size}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>
                  </td>

                  {/* DISCOUNT */}
                  <td>
                    {product.discount > 0 ? (
                      <span
                        className="
        px-3 py-1 rounded-md
        bg-primary/10
        text-primary
        text-sm
        border border-primary/30
      "
                      >
                        {product.discount}% OFF
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  {/* ----------------type----------- */}
                  <td>
                    <span
                      className="
    px-2 py-1 rounded-md
    text-xs border capitalize
    bg-[#faf7f2]
    border-[#e7dcc7]
    text-gray-700
  "
                    >
                      {product.type}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
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
                            care: product.care,
                            stone: product.stone,
                            material: product.material,
                          });

                          setDrawerOpen(true);
                        }}
                        className="
                        w-10 h-10 rounded-xl
                        bg-[#faf7f2]
                        flex items-center justify-center
                        hover:bg-[#f3ecdf]
                        transition
                      "
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setDeleteModal(true);
                          setProductToDelete(product._id);
                        }}
                        className="
                        w-10 h-10 rounded-xl
                        bg-red-50 text-red-600
                        flex items-center justify-center
                        hover:bg-red-100
                        transition
                      "
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* RIGHT DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex justify-end">
          <div
            className="
               w-[80vw] sm:w-[420px]
              h-full
              bg-white
              shadow-2xl
              p-6
              overflow-y-auto
            "
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <Package size={22} />
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Create a new jewelry product
                </p>
              </div>

              <button
                onClick={() => {
                  (setDrawerOpen(false), setDuplicateError(null));
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
                className="
                  w-10 h-10 rounded-xl
                  hover:bg-[#faf7f2]
                  flex items-center justify-center
                "
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-5">
              {/* IMAGE */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Product Image*</p>

                <label
                  className="
                    h-[180px]
                    border-2 border-dashed border-[#e7dcc7]
                    rounded-3xl
                    flex flex-col items-center justify-center
                    cursor-pointer
                    hover:bg-[#faf7f2]
                    transition
                    overflow-hidden
                  "
                >
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
                    <p className="text-red-500 text-sm mt-2">{errors.image}</p>
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

                    setFormData({
                      ...formData,
                      name: e.target.value,
                    });
                  }}
                  className="
                    w-full h-[50px]
                    border border-[#e7dcc7]
                    rounded-2xl px-4
                    outline-none
                    bg-[#faf7f2]
                  "
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
                      setFormData({
                        ...formData,
                        price: rawValue,
                      });
                    }
                  }}
                  className="
    w-full h-[50px]
    border border-[#e7dcc7]
    rounded-2xl px-4
    outline-none
    bg-[#faf7f2]
  "
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

                    setFormData({
                      ...formData,
                      category: e.target.value,
                    });
                  }}
                  className="
                    w-full h-[50px]
                    border border-[#e7dcc7]
                    rounded-2xl px-4
                    outline-none
                    bg-[#faf7f2]
                  "
                >
                  <option value="">Select Category</option>

                  {categories.map((cat) => (
                    <option key={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-2">{errors.category}</p>
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

                    if (e.target.value === "") {
                      setFormData({
                        ...formData,
                        stock: "",
                      });
                      return;
                    }

                    setFormData({
                      ...formData,
                      stock: e.target.value,
                    });
                  }}
                  className="
                    w-full h-[50px]
                    border border-[#e7dcc7]
                    rounded-2xl px-4
                    outline-none
                    bg-[#faf7f2]
                  "
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-2">{errors.stock}</p>
                )}
              </div>

              {/* DISCOUNT */}
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Discount %
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
                      setFormData({
                        ...formData,
                        discount: "",
                      });
                      return;
                    }

                    const num = Number(value);

                    if (num >= 0 && num <= 100) {
                      setFormData({
                        ...formData,
                        discount: num,
                      });
                    }
                  }}
                  className="
    w-full h-[50px]
    border border-[#e7dcc7]
    rounded-2xl px-4
    outline-none
    bg-[#faf7f2]
  "
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
                        .map((size) => size.trim())
                        .filter((size) => size !== ""),
                    });
                  }}
                  className="
        w-full h-[50px]
        border border-[#e7dcc7]
        rounded-2xl px-4
        outline-none
        bg-[#faf7f2]
      "
                />

                {/* SIZE PREVIEW */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.sizes.map((size, index) => (
                    <div
                      key={index}
                      className="
            px-3 py-1
            rounded-xl
            bg-[#faf7f2]
            border border-[#e7dcc7]
            text-sm text-gray-700
          "
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
                  {/* MALE */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        gender: "male",
                      })
                    }
                    className={`
        flex-1 h-[52px]
        rounded-2xl border
        flex items-center justify-center
        transition
        ${
          formData.gender === "male"
            ? "bg-blue-500 text-white border-blue-500 shadow-md"
            : "border-[#e7dcc7] bg-white text-gray-600"
        }
      `}
                  >
                    <Mars size={22} />
                  </button>

                  {/* FEMALE */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        gender: "female",
                      })
                    }
                    className={`
        flex-1 h-[52px]
        rounded-2xl border
        flex items-center justify-center
        transition
        ${
          formData.gender === "female"
            ? "bg-pink-500 text-white border-pink-500 shadow-md "
            : "border-[#e7dcc7] bg-white text-gray-600"
        }
      `}
                  >
                    <Venus size={22} />
                  </button>
                </div>
              </div>
              {/* Type */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Product Type</p>

                <div className="flex gap-3">
                  {["gold", "silver", "artificial"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type,
                        })
                      }
                      className={`
          flex-1 h-[50px]
          rounded-2xl border capitalize
          transition
          ${
            formData.type === type
              ? "bg-black text-white border-black shadow-md"
              : "border-[#e7dcc7] bg-white"
          }
        `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* stone */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Stone</p>

                <input
                  type="text"
                  value={formData.stone}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setFormData({
                        ...formData,
                        stone: "",
                      });
                      return;
                    }

                    setFormData({
                      ...formData,
                      stone: e.target.value,
                    });
                  }}
                  className="
                    w-full h-[50px]
                    border border-[#e7dcc7]
                    rounded-2xl px-4
                    outline-none
                    bg-[#faf7f2]
                  "
                />
              </div>
              {/* material */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Material</p>

                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setFormData({
                        ...formData,
                        material: "",
                      });
                      return;
                    }

                    setFormData({
                      ...formData,
                      material: e.target.value,
                    });
                  }}
                  className="
                    w-full h-[50px]
                    border border-[#e7dcc7]
                    rounded-2xl px-4
                    outline-none
                    bg-[#faf7f2]
                  "
                />
              </div>
              {/* care */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Care</p>

                <input
                  type="text"
                  value={formData.care}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setFormData({
                        ...formData,
                        care: "",
                      });
                      return;
                    }

                    setFormData({
                      ...formData,
                      care: e.target.value,
                    });
                  }}
                  className="
                    w-full h-[50px]
                    border border-[#e7dcc7]
                    rounded-2xl px-4
                    outline-none
                    bg-[#faf7f2]
                  "
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

                    setFormData({
                      ...formData,
                      description: e.target.value,
                    });
                  }}
                  className="
                    w-full
                    border border-[#e7dcc7]
                    rounded-2xl p-4
                    outline-none
                    bg-[#faf7f2]
                    resize-none
                  "
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
                  className="
                    flex-1 h-[50px]
                    rounded-2xl
                    border border-[#e7dcc7]
                    text-gray-700
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddProduct}
                  disabled={saving || (editingProduct && !hasChanges)}
                  className="
    flex-1 h-[50px]
    rounded-2xl
    bg-primary
    text-white
    disabled:opacity-50
  "
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
          </div>
        </div>
      )}
      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="
              w-full max-w-sm
              bg-white rounded-3xl
              p-6 shadow-2xl
            "
          >
            <h2 className="text-xl font-semibold text-gray-800">
              Delete Product
            </h2>

            <p className="text-gray-500 mt-2">
              Are you sure you want to delete this product?
            </p>

            <div className="flex gap-3 mt-6">
              <button
                disabled={deleting}
                onClick={() => {
                  setDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="
                  flex-1 h-[48px]
                  rounded-2xl
                  border border-[#e7dcc7]
                "
              >
                Cancel
              </button>

              <button
                disabled={deleting}
                onClick={handleDelete}
                className="
                  flex-1 h-[48px]
                  rounded-2xl
                  bg-red-500 text-white
                  disabled:opacity-50
                "
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
