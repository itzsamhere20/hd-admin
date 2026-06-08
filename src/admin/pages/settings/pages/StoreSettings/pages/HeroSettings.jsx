import { useEffect, useState } from "react";
import {
  LayoutPanelTop,
  ImagePlus,
  Palette,
  Save,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import SettingsLayout from "../../../components/SettingsLayout";
import api from "../../../../../api/api";

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

/* ── shared styles matching ProfileSettings / LandingSettings ── */
const INPUT =
  "w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors";
const TEXTAREA =
  "w-full border border-[#e7dcc7] rounded-2xl px-4 py-3 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors resize-none";
const LABEL = "text-xs text-gray-400 uppercase tracking-widest mb-2 block";

const HeroSettings = () => {
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState(initialState);
  const [leftFile, setLeftFile] = useState(null);
  const [rightFile, setRightFile] = useState(null);
  const [leftPreview, setLeftPreview] = useState("");
  const [rightPreview, setRightPreview] = useState("");

  /* ── FETCH ── */
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

  /* ── INPUT ── */
  const handleChange = (e) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ── IMAGE SELECT ── */
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

  /* ── UPLOAD ── */
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/upload", formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return { url: res.data.url, public_id: res.data.public_id };
  };

  /* ── SAVE ── */
  const handleSave = async () => {
    if (!dirty || initialLoading) return;
    try {
      setLoading(true);
      let leftImage = form.leftImage;
      let left_public_id = form.left_public_id;
      let rightImage = form.rightImage;
      let right_public_id = form.right_public_id;
      if (leftFile) {
        const u = await uploadImage(leftFile);
        leftImage = u.url;
        left_public_id = u.public_id;
      }
      if (rightFile) {
        const u = await uploadImage(rightFile);
        rightImage = u.url;
        right_public_id = u.public_id;
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

  /* ── CLEAR ── */
  const handleClear = () => {
    setForm(initialState);
    setLeftFile(null);
    setRightFile(null);
    setLeftPreview("");
    setRightPreview("");
    setDirty(true);
    toast.success("Form cleared");
  };

  /* ── IMAGE UPLOAD BOX ── */
  const ImageBox = ({ preview, image, onChange, onClear }) => (
    <div className="relative border-2 border-dashed border-[#e7dcc7] rounded-2xl h-[180px] overflow-hidden bg-[#faf7f2] hover:border-gray-400 transition-colors">
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      {preview || image ? (
        <>
          <img
            src={preview || image}
            className="w-full h-full object-contain"
            alt="preview"
          />
          {preview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute top-2 right-2 z-20 w-7 h-7 bg-white border border-[#e7dcc7] rounded-full flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition"
            >
              <X size={12} className="text-gray-500" />
            </button>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="w-9 h-9 rounded-2xl bg-white border border-[#e7dcc7] flex items-center justify-center">
            <ImagePlus size={16} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-400">Click to upload</p>
        </div>
      )}
    </div>
  );

  /* ── SECTION CARD ── */
  const SectionCard = ({ side }) => {
    const isLeft = side === "left";
    const titleKey = isLeft ? "leftTitle" : "rightTitle";
    const textKey = isLeft ? "leftText" : "rightText";
    const bgKey = isLeft ? "leftBg" : "rightBg";
    const preview = isLeft ? leftPreview : rightPreview;
    const image = isLeft ? form.leftImage : form.rightImage;
    const onImage = isLeft ? handleLeftImage : handleRightImage;
    const onClear = isLeft
      ? () => {
          setLeftPreview("");
          setLeftFile(null);
        }
      : () => {
          setRightPreview("");
          setRightFile(null);
        };

    return (
      <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
        {/* card header */}
        <div className="px-6 py-5 border-b border-[#e7dcc7] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center shrink-0">
            <LayoutPanelTop size={14} className="text-gray-500" />
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            {isLeft ? "Left Section" : "Right Section"}
          </p>
        </div>

        {/* card body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className={LABEL}>Image</label>
            <ImageBox
              preview={preview}
              image={image}
              onChange={onImage}
              onClear={onClear}
            />
          </div>

          <div>
            <label className={LABEL}>Title</label>
            <input
              name={titleKey}
              value={form[titleKey]}
              onChange={handleChange}
              placeholder={
                isLeft ? "e.g. Diamond Necklace" : "e.g. Bridal Collection"
              }
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL}>Description</label>
            <textarea
              name={textKey}
              value={form[textKey]}
              onChange={handleChange}
              rows={3}
              placeholder="Short description…"
              className={TEXTAREA}
            />
          </div>

          <div>
            <label className={`${LABEL} flex items-center gap-1.5`}>
              <Palette size={12} /> Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name={bgKey}
                value={form[bgKey]}
                onChange={handleChange}
                className="w-12 h-12 rounded-2xl border border-[#e7dcc7] cursor-pointer p-1 bg-[#faf7f2]"
              />
              <span className="text-sm text-gray-500 font-mono">
                {form[bgKey]}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SettingsLayout
      title="Hero Sections"
      description="Manage homepage promotional sections"
    >
      {/* OUTER CARD wrapper matching LandingSettings */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#e7dcc7] flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center text-gray-500 shrink-0">
            <LayoutPanelTop size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Homepage
            </p>
            <h2 className="font-luxury text-2xl text-gray-800 mt-0.5">
              Hero Sections
            </h2>
          </div>
        </div>

        {/* BODY */}
        <div className="px-7 py-6">
          {initialLoading ? (
            /* LOADER */
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#e7dcc7] border-t-gray-800 animate-spin" />
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Loading...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TWO SECTION CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard side="left" />
                <SectionCard side="right" />
              </div>

              {/* FOOTER BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={loading || !dirty}
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
          )}
        </div>
      </div>
    </SettingsLayout>
  );
};

export default HeroSettings;
