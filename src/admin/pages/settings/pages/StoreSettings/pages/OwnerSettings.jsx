import { useEffect, useState } from "react";
import {
  User2,
  ImagePlus,
  Save,
  Loader2,
  Trash2,
  Gem,
  Sparkles,
  Crown,
  Images,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import SettingsLayout from "../../../components/SettingsLayout";
import api from "../../../../../api/api";

const initialState = {
  name: "",
  description: "",
  image: "",
  public_id: "",
  storyImage: "",
  storyImage_public_id: "",
  aboutLeftImage: "",
  aboutLeftImage_public_id: "",
  aboutRightImage: "",
  aboutRightImage_public_id: "",
  aboutDescription: "",
  ourValueTitle: "Our Value",
  ourValueImage: "",
  ourValueImage_public_id: "",
  ourValueDescription: "",
  preciousCenterImage: "",
  preciousCenterImage_public_id: "",
  philosophyTitle: "Our Philosophy",
  philosophyImage: "",
  philosophyImage_public_id: "",
  philosophyDescription: "",
};

const INPUT =
  "w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors";
const TEXTAREA =
  "w-full border border-[#e7dcc7] rounded-2xl px-4 py-3 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors resize-none";
const LABEL = "text-xs text-gray-400 uppercase tracking-widest mb-2 block";

const OwnerSettings = () => {
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState(initialState);
  const [preview, setPreview] = useState({});
  const [files, setFiles] = useState({
    image: null,
    storyImage: null,
    aboutLeftImage: null,
    aboutRightImage: null,
    ourValueImage: null,
    preciousCenterImage: null,
    philosophyImage: null,
  });

  /* ── FETCH ── */
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const { data } = await api.get("/settings/store/owner");
        setForm({ ...initialState, ...data });
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchOwner();
  }, []);

  /* ── INPUT ── */
  const handleChange = (e) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ── IMAGE SELECT ── */
  const handleImageSelect = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    setDirty(true);
    setFiles((prev) => ({ ...prev, [key]: file }));
    setPreview((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const clearPreview = (key) => {
    setFiles((prev) => ({ ...prev, [key]: null }));
    setPreview((prev) => ({ ...prev, [key]: null }));
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

  /* ── PROCESS IMAGE ── */
  const processImage = async (key, publicKey) => {
    if (!files[key]) return { image: form[key], public_id: form[publicKey] };
    const uploaded = await uploadImage(files[key]);
    return { image: uploaded.url, public_id: uploaded.public_id };
  };

  /* ── SAVE ── */
  const handleSave = async () => {
    if (loading || !dirty) return;
    try {
      setLoading(true);
      const ownerImage = await processImage("image", "public_id");
      const storyImage = await processImage(
        "storyImage",
        "storyImage_public_id",
      );
      const aboutLeftImage = await processImage(
        "aboutLeftImage",
        "aboutLeftImage_public_id",
      );
      const aboutRightImage = await processImage(
        "aboutRightImage",
        "aboutRightImage_public_id",
      );
      const ourValueImage = await processImage(
        "ourValueImage",
        "ourValueImage_public_id",
      );
      const preciousCenterImage = await processImage(
        "preciousCenterImage",
        "preciousCenterImage_public_id",
      );
      const philosophyImage = await processImage(
        "philosophyImage",
        "philosophyImage_public_id",
      );

      const payload = {
        name: form.name,
        description: form.description,
        image: ownerImage.image,
        public_id: ownerImage.public_id,
        storyImage: storyImage.image,
        storyImage_public_id: storyImage.public_id,
        aboutLeftImage: aboutLeftImage.image,
        aboutLeftImage_public_id: aboutLeftImage.public_id,
        aboutRightImage: aboutRightImage.image,
        aboutRightImage_public_id: aboutRightImage.public_id,
        aboutDescription: form.aboutDescription,
        ourValueTitle: form.ourValueTitle,
        ourValueImage: ourValueImage.image,
        ourValueImage_public_id: ourValueImage.public_id,
        ourValueDescription: form.ourValueDescription,
        preciousCenterImage: preciousCenterImage.image,
        preciousCenterImage_public_id: preciousCenterImage.public_id,
        philosophyTitle: form.philosophyTitle,
        philosophyImage: philosophyImage.image,
        philosophyImage_public_id: philosophyImage.public_id,
        philosophyDescription: form.philosophyDescription,
      };

      const { data } = await api.put("/settings/store/owner", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setForm(data.owner);
      setDirty(false);
      setFiles({
        image: null,
        storyImage: null,
        aboutLeftImage: null,
        aboutRightImage: null,
        ourValueImage: null,
        preciousCenterImage: null,
        philosophyImage: null,
      });
      setPreview({});
      toast.success("About page updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── CLEAR ── */
  const handleClear = () => {
    setForm(initialState);
    setFiles({
      image: null,
      storyImage: null,
      aboutLeftImage: null,
      aboutRightImage: null,
      ourValueImage: null,
      preciousCenterImage: null,
      philosophyImage: null,
    });
    setPreview({});
    setDirty(true);
  };

  const isDisabled = loading || !dirty || initialLoading;

  /* ── IMAGE INPUT COMPONENT ── */
  const ImageInput = ({ label, value, field, height = "h-[200px]" }) => (
    <div>
      <label className={LABEL}>{label}</label>
      <div
        className={`relative border-2 border-dashed border-[#e7dcc7] rounded-2xl ${height} overflow-hidden bg-[#faf7f2] hover:border-gray-400 transition-colors`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageSelect(e, field)}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        {preview[field] || value ? (
          <>
            <img
              src={preview[field] || value}
              alt={label}
              className="w-full h-full object-contain"
            />
            {preview[field] && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearPreview(field);
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
    </div>
  );

  /* ── SECTION HEADER ── */
  const SectionHeader = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center shrink-0">
        <Icon size={15} className="text-gray-500" />
      </div>
      <p className="text-xs text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );

  return (
    <SettingsLayout
      title="About Us Content"
      description="Manage complete About page content"
    >
      {/* OUTER CARD */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#e7dcc7] flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center text-gray-500 shrink-0">
            <Gem size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Luxury Content
            </p>
            <h2 className="font-luxury text-2xl text-gray-800 mt-0.5">
              About Page Settings
            </h2>
          </div>
        </div>

        {/* BODY */}
        <div className="px-7 py-6">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#e7dcc7] border-t-gray-800 animate-spin" />
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Loading...
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ── OWNER ── */}
              <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e7dcc7]">
                  <SectionHeader icon={User2} label="Owner Details" />
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ImageInput
                      label="Owner Image"
                      value={form.image}
                      field="image"
                      height="h-[200px]"
                    />
                    <div className="space-y-4 flex flex-col justify-center">
                      <div>
                        <label className={LABEL}>Owner Name</label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="e.g. Hamdam Jewellers"
                          className={INPUT}
                        />
                      </div>
                      <div>
                        <label className={LABEL}>Description</label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          rows={5}
                          placeholder="Owner description…"
                          className={TEXTAREA}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── OUR STORY ── */}
              <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e7dcc7]">
                  <SectionHeader icon={Images} label="Our Story Section" />
                </div>
                <div className="px-6 py-5">
                  <ImageInput
                    label="Story Image"
                    value={form.storyImage}
                    field="storyImage"
                    height="h-[200px]"
                  />
                </div>
              </div>

              {/* ── ABOUT US ── */}
              <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e7dcc7]">
                  <SectionHeader icon={Sparkles} label="About Us Section" />
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ImageInput
                      label="Left Image"
                      value={form.aboutLeftImage}
                      field="aboutLeftImage"
                      height="h-[200px]"
                    />
                    <ImageInput
                      label="Right Image"
                      value={form.aboutRightImage}
                      field="aboutRightImage"
                      height="h-[200px]"
                    />
                  </div>
                  <div>
                    <label className={LABEL}>About Description</label>
                    <textarea
                      name="aboutDescription"
                      value={form.aboutDescription}
                      onChange={handleChange}
                      rows={5}
                      placeholder="About us paragraph…"
                      className={TEXTAREA}
                    />
                  </div>
                </div>
              </div>

              {/* ── PRECIOUS METAL ── */}
              <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e7dcc7]">
                  <SectionHeader icon={Crown} label="Precious Metal Section" />
                </div>
                <div className="px-6 py-5 space-y-6">
                  {/* OUR VALUE + CENTER + PHILOSOPHY in 2-col grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* OUR VALUE */}
                    <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl p-5 space-y-4">
                      <p className="text-xs text-gray-400 uppercase tracking-widest">
                        Our Value
                      </p>
                      <div>
                        <label className={LABEL}>Title</label>
                        <input
                          name="ourValueTitle"
                          value={form.ourValueTitle}
                          onChange={handleChange}
                          placeholder="Our Value"
                          className={INPUT}
                        />
                      </div>
                      <ImageInput
                        label="Image"
                        value={form.ourValueImage}
                        field="ourValueImage"
                        height="h-[160px]"
                      />
                      <div>
                        <label className={LABEL}>Description</label>
                        <textarea
                          name="ourValueDescription"
                          value={form.ourValueDescription}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Our value paragraph…"
                          className={TEXTAREA}
                        />
                      </div>
                    </div>

                    {/* PHILOSOPHY */}
                    <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl p-5 space-y-4">
                      <p className="text-xs text-gray-400 uppercase tracking-widest">
                        Our Philosophy
                      </p>
                      <div>
                        <label className={LABEL}>Title</label>
                        <input
                          name="philosophyTitle"
                          value={form.philosophyTitle}
                          onChange={handleChange}
                          placeholder="Our Philosophy"
                          className={INPUT}
                        />
                      </div>
                      <ImageInput
                        label="Image"
                        value={form.philosophyImage}
                        field="philosophyImage"
                        height="h-[160px]"
                      />
                      <div>
                        <label className={LABEL}>Description</label>
                        <textarea
                          name="philosophyDescription"
                          value={form.philosophyDescription}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Philosophy paragraph…"
                          className={TEXTAREA}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CENTER IMAGE — full width below */}
                  <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl p-5">
                    <ImageInput
                      label="Center Image"
                      value={form.preciousCenterImage}
                      field="preciousCenterImage"
                      height="h-[180px]"
                    />
                  </div>
                </div>
              </div>

              {/* ── FOOTER BUTTONS ── */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isDisabled}
                  className="flex-1 h-[50px] rounded-2xl bg-primary text-white text-sm font-medium hover:opacity-80 transition disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Details
                    </>
                  )}
                </button>
                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="h-[50px] px-5 rounded-2xl border border-[#e7dcc7] text-gray-500 hover:bg-[#faf7f2] transition disabled:opacity-40 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsLayout>
  );
};

export default OwnerSettings;
