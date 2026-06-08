import { useEffect, useState } from "react";
import { Images, Save, Loader2, ImagePlus, Palette, X } from "lucide-react";
import toast from "react-hot-toast";
import SettingsLayout from "../../../components/SettingsLayout";
import api from "../../../../../api/api";

const defaultSlides = [
  {
    title: "",
    paragraph: "",
    mainImage: "",
    main_public_id: "",
    pngImage: "",
    png_public_id: "",
    color: "#000000",
  },
  {
    title: "",
    paragraph: "",
    mainImage: "",
    main_public_id: "",
    pngImage: "",
    png_public_id: "",
    color: "#000000",
  },
  {
    title: "",
    paragraph: "",
    mainImage: "",
    main_public_id: "",
    pngImage: "",
    png_public_id: "",
    color: "#000000",
  },
];

const INPUT =
  "w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors";
const TEXTAREA =
  "w-full border border-[#e7dcc7] rounded-2xl px-4 py-3 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors resize-none";
const LABEL = "text-xs text-gray-400 uppercase tracking-widest mb-2 block";

const SliderSettings = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [slides, setSlides] = useState(defaultSlides);
  const [initialSlides, setInitialSlides] = useState([]);

  /* ── FETCH ── */
  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const { data } = await api.get("/settings/store/slider");
        const fetched = data?.slides?.length > 0 ? data.slides : defaultSlides;
        setSlides(fetched);
        setInitialSlides(fetched);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchSlider();
  }, []);

  /* ── INPUT ── */
  const handleChange = (index, field, value) => {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index ? { ...slide, [field]: value } : slide,
      ),
    );
  };

  /* ── IMAGE SELECT ── */
  const handleImageSelect = (index, type, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSlides((prev) =>
      prev.map((slide, i) => {
        if (i !== index) return slide;
        if (type === "main")
          return { ...slide, mainImage: preview, mainFile: file };
        return { ...slide, pngImage: preview, pngFile: file };
      }),
    );
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

  /* ── CHANGE DETECT ── */
  const hasChanges = () =>
    JSON.stringify(
      slides.map(({ title, paragraph, mainImage, pngImage, color }) => ({
        title,
        paragraph,
        mainImage,
        pngImage,
        color,
      })),
    ) !==
    JSON.stringify(
      initialSlides.map(({ title, paragraph, mainImage, pngImage, color }) => ({
        title,
        paragraph,
        mainImage,
        pngImage,
        color,
      })),
    );

  /* ── SAVE ── */
  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedSlides = await Promise.all(
        slides.map(async (slide) => {
          let mainImage = slide.mainImage;
          let main_public_id = slide.main_public_id;
          let pngImage = slide.pngImage;
          let png_public_id = slide.png_public_id;
          if (slide.mainFile) {
            const u = await uploadImage(slide.mainFile);
            mainImage = u.url;
            main_public_id = u.public_id;
          }
          if (slide.pngFile) {
            const u = await uploadImage(slide.pngFile);
            pngImage = u.url;
            png_public_id = u.public_id;
          }
          return {
            ...slide,
            mainImage,
            main_public_id,
            pngImage,
            png_public_id,
          };
        }),
      );
      await api.put("/settings/store/slider", { slides: updatedSlides });
      setSlides(updatedSlides);
      setInitialSlides(updatedSlides);
      toast.success("Slider updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── IMAGE BOX ── */
  const ImageBox = ({
    src,
    height = "h-[180px]",
    onChange,
    onClear,
    hasFile,
  }) => (
    <div
      className={`relative border-2 border-dashed border-[#e7dcc7] rounded-2xl ${height} overflow-hidden bg-[#faf7f2] hover:border-gray-400 transition-colors`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      {src ? (
        <>
          <img
            src={src}
            className="w-full h-full object-contain"
            alt="preview"
          />
          {hasFile && (
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

  return (
    <SettingsLayout
      title="Homepage Slider"
      description="Manage homepage slides"
    >
      {/* OUTER CARD */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#e7dcc7] flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center text-gray-500 shrink-0">
            <Images size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Homepage
            </p>
            <h2 className="font-luxury text-2xl text-gray-800 mt-0.5">
              Slider Sections
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden"
                  >
                    {/* slide card header */}
                    <div className="px-6 py-5 border-b border-[#e7dcc7] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center shrink-0">
                        <Images size={14} className="text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest">
                        Slide {index + 1}
                      </p>
                    </div>

                    {/* slide card body */}
                    <div className="px-6 py-5 space-y-4">
                      {/* MAIN IMAGE */}
                      <div>
                        <label className={LABEL}>Main Image</label>
                        <ImageBox
                          src={slide.mainImage}
                          height="h-[180px]"
                          hasFile={!!slide.mainFile}
                          onChange={(e) =>
                            handleImageSelect(index, "main", e.target.files[0])
                          }
                          onClear={() =>
                            setSlides((prev) =>
                              prev.map((s, i) =>
                                i === index
                                  ? {
                                      ...s,
                                      mainImage:
                                        initialSlides[index]?.mainImage || "",
                                      mainFile: null,
                                    }
                                  : s,
                              ),
                            )
                          }
                        />
                      </div>

                      {/* PNG IMAGE */}
                      <div>
                        <label className={LABEL}>PNG Overlay Image</label>
                        <ImageBox
                          src={slide.pngImage}
                          height="h-[140px]"
                          hasFile={!!slide.pngFile}
                          onChange={(e) =>
                            handleImageSelect(index, "png", e.target.files[0])
                          }
                          onClear={() =>
                            setSlides((prev) =>
                              prev.map((s, i) =>
                                i === index
                                  ? {
                                      ...s,
                                      pngImage:
                                        initialSlides[index]?.pngImage || "",
                                      pngFile: null,
                                    }
                                  : s,
                              ),
                            )
                          }
                        />
                      </div>

                      {/* TITLE */}
                      <div>
                        <label className={LABEL}>Title</label>
                        <input
                          value={slide.title}
                          onChange={(e) =>
                            handleChange(index, "title", e.target.value)
                          }
                          placeholder="e.g. Diamond Elegance"
                          className={INPUT}
                        />
                      </div>

                      {/* PARAGRAPH */}
                      <div>
                        <label className={LABEL}>Paragraph</label>
                        <textarea
                          rows={3}
                          value={slide.paragraph}
                          onChange={(e) =>
                            handleChange(index, "paragraph", e.target.value)
                          }
                          placeholder="e.g. Adjustable · 18K Gold · Diamond"
                          className={TEXTAREA}
                        />
                      </div>

                      {/* COLOR */}
                      <div>
                        <label className={`${LABEL} flex items-center gap-1.5`}>
                          <Palette size={12} /> Slide Background Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={slide.color || "#000000"}
                            onChange={(e) =>
                              handleChange(index, "color", e.target.value)
                            }
                            className="w-12 h-12 rounded-2xl border border-[#e7dcc7] cursor-pointer p-1 bg-[#faf7f2]"
                          />
                          <span className="text-sm text-gray-500 font-mono">
                            {slide.color || "#000000"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={loading || !hasChanges()}
                  className="flex-1 h-[50px] rounded-2xl bg-primary text-white text-sm font-medium hover:opacity-80 transition disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Slides
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsLayout>
  );
};

export default SliderSettings;
