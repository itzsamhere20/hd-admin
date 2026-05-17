import { useEffect, useState } from "react";
import api from "../../../api/api";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Check,
  X,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Categories = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [color, setColor] = useState(""); // ✅ NEW

  const [editImage, setEditImage] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editColor, setEditColor] = useState(""); // ✅ NEW

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= UPLOAD =================
  const uploadImage = async (file) => {
    const form = new FormData();
    form.append("image", file);

    const res = await api.post("/upload", form, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return {
      url: res.data.url,
      public_id: res.data.public_id,
    };
  };

  // ================= ADD =================
  const handleAdd = async () => {
    if (!name.trim()) {
      setError("Write name to add category");
      return;
    }

    if (!imageFile) {
      setError("Please upload a category image");
      return;
    }

    try {
      setLoading(true);

      const uploaded = await uploadImage(imageFile);

      const res = await api.post("/categories/create", {
        name,
        image: uploaded.url,
        public_id: uploaded.public_id,
        color, // ✅ NEW
      });

      setCategories((prev) => [res.data, ...prev]);

      setName("");
      setImage("");
      setImageFile(null);
      setColor(""); // ✅ NEW
      setError("");

      toast.success("Category added successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      setDeleting(true);

      await api.delete(`/categories/${id}`);

      setCategories((prev) => prev.filter((c) => c._id !== id));

      toast.success("Category deleted successfully");
    } catch (err) {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async (id) => {
    const current = categories.find((c) => c._id === id);
    if (!current) return;

    if (
      current.name === editName &&
      !editImageFile &&
      current.color === editColor
    ) {
      setEditingId(null);
      return;
    }

    try {
      setUpdating(true);

      let uploaded = null;

      if (editImageFile) {
        uploaded = await uploadImage(editImageFile);
      }

      const res = await api.put(`/categories/${id}`, {
        name: editName,
        image: uploaded ? uploaded.url : current.image,
        public_id: uploaded ? uploaded.public_id : current.public_id,
        color: editColor, // ✅ NEW
      });

      setCategories((prev) => prev.map((c) => (c._id === id ? res.data : c)));

      setEditingId(null);
      setEditName("");
      setEditImage("");
      setEditImageFile(null);
      setEditColor(""); // ✅ NEW

      toast.success("Category updated successfully");
    } catch (err) {
      toast.error("Failed to update category");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/products")}
          className="w-11 h-11 rounded-2xl border border-[#e7dcc7] bg-white flex items-center justify-center hover:bg-[#faf7f2] transition"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="font-luxury text-3xl lg:text-5xl text-gray-800">
            Categories
          </h1>
          <p className="font-cormorant text-lg text-gray-500 mt-1">
            Manage product categories
          </p>
        </div>
      </div>

      {/* ADD */}
      <div className="flex gap-3 flex-wrap">
        <label className="w-[50px] h-[50px] border border-[#e7dcc7] rounded-2xl flex items-center justify-center cursor-pointer bg-white overflow-hidden">
          {image ? (
            <img src={image} className="w-full h-full object-cover" />
          ) : (
            <Upload size={18} />
          )}

          <input
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              setImageFile(file);
              setImage(URL.createObjectURL(file));
            }}
          />
        </label>

        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter category name"
          className="flex-1 h-[50px] border border-[#e7dcc7] rounded-2xl px-4 bg-white outline-none"
        />

        {/* COLOR PICKER */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-[50px] h-[50px] border rounded-2xl cursor-pointer"
        />

        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-primary text-white px-6 rounded-2xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* LIST */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
        {categories.map((cat, index) => (
          <div
            key={cat._id}
            className={`flex items-center justify-between p-5 ${
              index !== categories.length - 1 ? "border-b border-[#eee2cc]" : ""
            }`}
          >
            <div className="flex-1 flex items-center gap-3">
              {editingId === cat._id ? (
                <>
                  <label className="w-10 h-10 border rounded-xl overflow-hidden cursor-pointer flex items-center justify-center">
                    {editImage ? (
                      <img
                        src={editImage}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload size={14} />
                    )}

                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        setEditImageFile(file);
                        setEditImage(URL.createObjectURL(file));
                      }}
                    />
                  </label>

                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-[45px] border border-[#e7dcc7] rounded-xl px-3 outline-none"
                  />

                  {/* EDIT COLOR */}
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border"
                  />
                </>
              ) : (
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl transition"
                  style={{
                    backgroundColor: cat.color || "#faf7f2",
                  }}
                >
                  {cat.image && (
                    <img
                      src={cat.image}
                      className="w-10 h-10 rounded-xl object-cover border border-white/40"
                    />
                  )}

                  <p className="font-cormorant text-xl text-white">
                    {cat.name}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 ml-5">
              {editingId === cat._id ? (
                <>
                  <button
                    onClick={() => handleUpdate(cat._id)}
                    disabled={updating}
                    className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"
                  >
                    <Check size={18} />
                  </button>

                  <button
                    onClick={() => setEditingId(null)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(cat._id);
                    setEditName(cat.name);
                    setEditImage(cat.image || "");
                    setEditColor(cat.color || ""); // ✅ NEW
                  }}
                  className="w-10 h-10 rounded-xl bg-[#faf7f2] flex items-center justify-center"
                >
                  <Pencil size={18} />
                </button>
              )}

              <button
                onClick={() => {
                  setDeleteModal(true);
                  setCategoryToDelete(cat);
                }}
                className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-800">
              Delete Category
            </h2>

            <p className="text-gray-500 mt-2">
              Are you sure you want to delete this category?
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 h-[48px] rounded-2xl border border-[#e7dcc7]"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDelete(categoryToDelete._id);
                  setDeleteModal(false);
                  setCategoryToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 h-[48px] rounded-2xl bg-red-500 text-white"
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

export default Categories;
