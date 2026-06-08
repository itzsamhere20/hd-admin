import { useEffect, useState } from "react";
import { ImagePlus, Save, Loader2, Type, AlignLeft, X } from "lucide-react";
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

  /* ── FETCH ── */
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

  /* ── INPUT ── */
  const handleChange = (e) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ── IMAGE SELECT ── */
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDirty(true);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ── UPLOAD ── */
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/upload", formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  };

  /* ── SAVE ── */
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
        title: form.title,
        italicTitle: form.italicTitle,
        paragraph: form.paragraph,
        image: imageUrl,
        public_id: publicId,
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

  /* ── CLEAR ── */
  const handleClear = () => {
    setForm(initialState);
    setImageFile(null);
    setPreview("");
    setDirty(true);
    toast.success("Form cleared");
  };

  /* ── SHARED STYLES ── */
  const INPUT =
    "w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors";
  const LABEL = "text-xs text-gray-400 uppercase tracking-widest mb-2 block";

  if (initialLoading) {
    return (
      <SettingsLayout
        title="Landing Page"
        description="Customize landing hero section"
      >
        <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden w-full">
          <div className="px-7 py-6 border-b border-[#e7dcc7] flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center text-gray-500 shrink-0">
              <ImagePlus size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Homepage
              </p>
              <h2 className="font-luxury text-2xl text-gray-800 mt-0.5">
                Landing Section
              </h2>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#e7dcc7] border-t-gray-800 animate-spin" />
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Loading...
            </p>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Landing Page"
      description="Customize landing hero section"
    >
      {/* CARD */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden w-full">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#e7dcc7] flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center text-gray-500 shrink-0">
            <ImagePlus size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Homepage
            </p>
            <h2 className="font-luxury text-2xl text-gray-800 mt-0.5">
              Landing Section
            </h2>
          </div>
        </div>

        {/* BODY */}
        <div className="px-7 py-6 space-y-6">
          {/* IMAGE UPLOAD */}
          <div>
            <label className={LABEL}>Landing Image</label>
            <div className="relative mt-1 border-2 border-dashed border-[#e7dcc7] rounded-2xl h-[200px] overflow-hidden bg-[#faf7f2] hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {preview || form.image ? (
                <>
                  <img
                    src={preview || form.image}
                    className="w-full h-full object-cover"
                    alt="Landing preview"
                  />
                  {/* remove preview */}
                  {preview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview("");
                        setImageFile(null);
                      }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 bg-white border border-[#e7dcc7] rounded-full flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-[#e7dcc7] flex items-center justify-center">
                    <ImagePlus size={18} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">Click to upload image</p>
                  <p className="text-xs text-gray-300">PNG, JPG, WEBP</p>
                </div>
              )}
            </div>
          </div>

          {/* MAIN TITLE */}
          <div>
            <label className={LABEL}>Main Title</label>
            <div className="relative">
              <Type
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              />
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Elegant Pieces"
                className={`${INPUT} pl-11`}
              />
            </div>
          </div>

          {/* ITALIC TITLE */}
          <div>
            <label className={LABEL}>Italic Title</label>
            <input
              name="italicTitle"
              value={form.italicTitle}
              onChange={handleChange}
              placeholder="e.g. For Every Moment"
              className={`${INPUT} italic`}
            />
          </div>

          {/* PARAGRAPH */}
          <div>
            <label className={LABEL}>Paragraph</label>
            <div className="relative">
              <AlignLeft
                size={15}
                className="absolute left-4 top-4 text-gray-300 pointer-events-none"
              />
              <textarea
                name="paragraph"
                value={form.paragraph}
                onChange={handleChange}
                rows={4}
                placeholder="Short description shown under the title…"
                className="w-full border border-[#e7dcc7] rounded-2xl pl-11 pr-4 py-3 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-7 py-5 border-t border-[#e7dcc7] flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading || !dirty || initialLoading}
            className="flex-1 h-[50px] rounded-2xl bg-primary text-white text-sm font-medium hover:opacity-80 transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            className="flex-1 h-[50px] rounded-2xl border border-[#e7dcc7] text-gray-700 text-sm hover:bg-[#faf7f2] transition"
          >
            Clear
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default LandingSettings;
