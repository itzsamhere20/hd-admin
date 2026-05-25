import { useEffect, useState } from "react";
import { ImagePlus, Save, Loader2, Type, AlignLeft } from "lucide-react";
import toast from "react-hot-toast";

import SettingsLayout from "../../../components/SettingsLayout";
import api from "../../../../../api/api";

const initialState = {
  title: "",
  italicTitle: "",
  paragraph: "",
  image: "",
  public_id: "",
};

const LandingSettings = () => {
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState(initialState);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchLanding = async () => {
      try {
        const { data } = await api.get("/settings/store/landing");
        setForm(data || initialState);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchLanding();
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

    return res.data; // {url, public_id}
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (initialLoading || !dirty) return;

    try {
      setLoading(true);

      let imageUrl = form.image;
      let publicId = form.public_id;

      // upload new image if selected
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        imageUrl = uploaded.url;
        publicId = uploaded.public_id;
      }

      const payload = {
        title: form.title,
        italicTitle: form.italicTitle,
        paragraph: form.paragraph,
        image: imageUrl,
        public_id: publicId, // ✅ FIXED (no fallback override)
      };

      await api.put("/settings/store/landing", payload);

      setForm(payload);
      setImageFile(null);
      setPreview("");
      setDirty(false);

      toast.success("Landing updated successfully");
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
    setDirty(true); // user changed state

    toast.success("Form cleared");
  };

  return (
    <SettingsLayout
      title="Landing Page"
      description="Customize landing hero section"
    >
      <div className="bg-white border border-[#ece7df] rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#f1ebe3] flex items-center gap-4">
          <div className="w-14 h-14 bg-[#faf7f2] border border-[#ece7df] flex items-center justify-center">
            <ImagePlus size={24} className="text-primary" />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
              Homepage
            </p>
            <h2 className="mt-2 text-4xl font-cormorant">Landing Section</h2>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-7 space-y-6">
          {/* IMAGE */}
          <div>
            <label className="text-[11px] tracking-[0.3em] uppercase text-neutral-500">
              Landing Image
            </label>

            <div className="mt-3 border border-dashed border-[#d8cfc3] rounded-md h-[220px] relative overflow-hidden bg-[#faf7f2]">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {preview || form.image ? (
                <img
                  src={preview || form.image}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <ImagePlus className="text-neutral-400" size={30} />
                  <p className="mt-3 text-sm text-neutral-500">
                    Upload Landing Image
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* TITLE */}
          <div>
            <label className="text-[11px] tracking-[0.3em] uppercase text-neutral-500">
              Main Title
            </label>

            <div className="relative mt-3">
              <Type
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* ITALIC TITLE */}
          <div>
            <label className="text-[11px] tracking-[0.3em] uppercase text-neutral-500">
              Italic Title
            </label>

            <input
              name="italicTitle"
              value={form.italicTitle}
              onChange={handleChange}
              className="mt-3 w-full h-14 px-5 rounded-md border border-[#ece7df] outline-none focus:border-primary italic"
            />
          </div>

          {/* PARAGRAPH */}
          <div>
            <label className="text-[11px] tracking-[0.3em] uppercase text-neutral-500">
              Paragraph
            </label>

            <div className="relative mt-3">
              <AlignLeft
                size={18}
                className="absolute left-5 top-5 text-neutral-400"
              />

              <textarea
                name="paragraph"
                value={form.paragraph}
                onChange={handleChange}
                rows={5}
                className="w-full pl-14 pr-5 py-4 rounded-md border border-[#ece7df] outline-none resize-none focus:border-primary"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading || !dirty || initialLoading}
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
                  Save Changes
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              className="h-14 px-6 border border-[#ece7df] text-gray-600 uppercase tracking-[0.2em] text-sm hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default LandingSettings;
