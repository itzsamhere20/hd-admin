import { useEffect, useState } from "react";
import { User2, ImagePlus, Save, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import SettingsLayout from "../../../components/SettingsLayout";
import api from "../../../../../api/api";

const initialState = {
  name: "",
  description: "",
  image: "",
  public_id: "",
};

const OwnerSettings = () => {
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState(initialState);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const { data } = await api.get("/settings/store/owner");
        setForm(data || initialState);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchOwner();
  }, []);

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= IMAGE ================= */
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDirty(true);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPLOAD ================= */
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await api.post("/upload", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return {
      url: res.data.url,
      public_id: res.data.public_id,
    };
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (initialLoading || !dirty) return;

    try {
      setLoading(true);

      let imageUrl = form.image;
      let publicId = form.public_id;

      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        imageUrl = uploaded.url;
        publicId = uploaded.public_id;
      }

      const payload = {
        name: form.name || "",
        description: form.description || "",
        image: imageUrl || "",
        public_id: publicId || form.public_id,
      };

      await api.put("/settings/store/owner", payload);

      setForm(payload);
      setImageFile(null);
      setPreview("");
      setDirty(false);

      toast.success("Owner details updated");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CLEAR ================= */
  const handleClear = () => {
    setForm(initialState);
    setImageFile(null);
    setPreview("");
    setDirty(true);
  };

  const isDisabled = loading || !dirty || initialLoading;

  return (
    <SettingsLayout
      title="Owner Details"
      description="Manage owner information"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#f1ebe3] flex items-center gap-4">
          <div className="w-14 h-14 bg-[#faf7f2] border border-[#ece7df] flex items-center justify-center">
            <User2 size={24} className="text-primary" />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
              Store Owner
            </p>
            <h2 className="mt-2 text-4xl font-cormorant">Owner Information</h2>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-7 space-y-6">
          {/* IMAGE */}
          <div className="relative h-[260px] border border-dashed border-[#d8cfc3] rounded-md bg-[#faf7f2] overflow-hidden flex items-center justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />

            {preview || form.image ? (
              <img
                src={preview || form.image}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <ImagePlus className="mx-auto text-neutral-400" size={30} />
                <p className="mt-3 text-sm text-neutral-500">
                  Upload Owner Image
                </p>
              </div>
            )}
          </div>

          {/* NAME */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Owner Name"
            className="w-full h-14 px-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="Brand Description"
            className="w-full px-5 py-4 rounded-md border border-[#ece7df] outline-none resize-none focus:border-primary"
          />

          {/* BUTTONS */}
          <div className="flex gap-3">
            {/* SAVE */}
            <button
              onClick={handleSave}
              disabled={isDisabled}
              className="h-14 px-8 bg-primary text-white uppercase tracking-[0.2em] text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Details
                </>
              )}
            </button>

            {/* CLEAR */}
            <button
              onClick={handleClear}
              disabled={loading}
              className="h-14 px-6 border border-[#ece7df] text-gray-600 uppercase tracking-[0.2em] text-sm"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default OwnerSettings;
