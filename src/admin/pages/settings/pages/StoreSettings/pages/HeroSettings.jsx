import { useEffect, useState } from "react";
import {
  LayoutPanelTop,
  ImagePlus,
  Palette,
  Save,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import SettingsLayout from "../../../components/SettingsLayout";
import api from "../../../../../api/api";

/* ================= INITIAL STATE ================= */
const initialState = {
  leftTitle: "",
  leftText: "",
  leftImage: "",
  left_public_id: "",
  rightTitle: "",
  rightText: "",
  rightImage: "",
  right_public_id: "",
  leftBg: "#000000",
  rightBg: "#000000",
};

const HeroSettings = () => {
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState(initialState);

  const [leftFile, setLeftFile] = useState(null);
  const [rightFile, setRightFile] = useState(null);

  const [leftPreview, setLeftPreview] = useState("");
  const [rightPreview, setRightPreview] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const { data } = await api.get("/settings/store/hero");
        setForm(data || initialState);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchHero();
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= IMAGE SELECT ================= */
  const handleLeftImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDirty(true);
    setLeftFile(file);
    setLeftPreview(URL.createObjectURL(file));
  };

  const handleRightImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDirty(true);
    setRightFile(file);
    setRightPreview(URL.createObjectURL(file));
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
    if (!dirty || initialLoading) return;

    try {
      setLoading(true);

      let leftImage = form.leftImage;
      let left_public_id = form.left_public_id;

      let rightImage = form.rightImage;
      let right_public_id = form.right_public_id;

      if (leftFile) {
        const uploaded = await uploadImage(leftFile);
        leftImage = uploaded.url;
        left_public_id = uploaded.public_id;
      }

      if (rightFile) {
        const uploaded = await uploadImage(rightFile);
        rightImage = uploaded.url;
        right_public_id = uploaded.public_id;
      }

      const payload = {
        ...form,
        leftImage,
        left_public_id,
        rightImage,
        right_public_id,
      };

      await api.put("/settings/store/hero", payload);

      setForm(payload);
      setLeftFile(null);
      setRightFile(null);
      setLeftPreview("");
      setRightPreview("");
      setDirty(false);

      toast.success("Hero updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CLEAR ================= */
  const handleClear = () => {
    setForm(initialState);
    setLeftFile(null);
    setRightFile(null);
    setLeftPreview("");
    setRightPreview("");
    setDirty(true);

    toast.success("Form cleared");
  };

  /* ================= UI ================= */
  return (
    <SettingsLayout
      title="Hero Sections"
      description="Manage homepage promotional sections"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#f1ebe3] flex items-center gap-4">
          <div className="w-14 h-14 bg-[#faf7f2] border border-[#ece7df] flex items-center justify-center">
            <LayoutPanelTop size={24} className="text-primary" />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
              Homepage
            </p>
            <h2 className="mt-2 text-4xl font-cormorant">Hero Sections</h2>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-7 grid grid-cols-1 gap-10">
          {/* ================= LEFT ================= */}
          <div className="space-y-5">
            <h3 className="text-xl font-cormorant">Left Section</h3>

            {/* IMAGE BOX (CENTERED FIXED) */}
            <div className="h-[240px] border border-dashed border-[#d8cfc3] rounded-md bg-[#faf7f2] relative overflow-hidden">
              <input
                type="file"
                onChange={handleLeftImage}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {leftPreview || form.leftImage ? (
                <img
                  src={leftPreview || form.leftImage}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <ImagePlus size={32} className="text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-500">Upload Left Image</p>
                </div>
              )}
            </div>

            <input
              name="leftTitle"
              value={form.leftTitle}
              onChange={handleChange}
              placeholder="Left Title"
              className="w-full h-14 px-5 rounded-md border border-[#ece7df]"
            />

            <textarea
              name="leftText"
              value={form.leftText}
              onChange={handleChange}
              rows={4}
              placeholder="Left Paragraph"
              className="w-full px-5 py-4 rounded-md border border-[#ece7df]"
            />

            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase text-neutral-500 flex items-center gap-2 mb-3">
                <Palette size={14} />
                Left Background Color
              </label>

              <input
                type="color"
                name="leftBg"
                value={form.leftBg}
                onChange={handleChange}
                className="w-full h-14 border border-[#ece7df] rounded-md"
              />
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="space-y-5">
            <h3 className="text-xl font-cormorant">Right Section</h3>

            <div className="h-[240px] border border-dashed border-[#d8cfc3] rounded-md bg-[#faf7f2] relative overflow-hidden">
              <input
                type="file"
                onChange={handleRightImage}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {rightPreview || form.rightImage ? (
                <img
                  src={rightPreview || form.rightImage}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <ImagePlus size={32} className="text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-500">Upload Right Image</p>
                </div>
              )}
            </div>

            <input
              name="rightTitle"
              value={form.rightTitle}
              onChange={handleChange}
              placeholder="Right Title"
              className="w-full h-14 px-5 rounded-md border border-[#ece7df]"
            />

            <textarea
              name="rightText"
              value={form.rightText}
              onChange={handleChange}
              rows={4}
              placeholder="Right Paragraph"
              className="w-full px-5 py-4 rounded-md border border-[#ece7df]"
            />

            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase text-neutral-500 flex items-center gap-2 mb-3">
                <Palette size={14} />
                Right Background Color
              </label>

              <input
                type="color"
                name="rightBg"
                value={form.rightBg}
                onChange={handleChange}
                className="w-full h-14 border border-[#ece7df] rounded-md"
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="px-7 pb-7 flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading || !dirty}
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
    </SettingsLayout>
  );
};

export default HeroSettings;
