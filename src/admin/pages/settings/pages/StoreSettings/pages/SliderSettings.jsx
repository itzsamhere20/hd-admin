import { useEffect, useState } from "react";
import { Images, Save, Loader2, ImagePlus } from "lucide-react";
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

const SliderSettings = () => {
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState(defaultSlides);
  const [initialSlides, setInitialSlides] = useState([]);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const { data } = await api.get("/settings/store/slider");

        const fetchedSlides =
          data?.slides?.length > 0 ? data.slides : defaultSlides;

        setSlides(fetchedSlides);
        setInitialSlides(fetchedSlides);
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchSlider();
  }, []);

  /* ================= INPUT ================= */
  const handleChange = (index, field, value) => {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index ? { ...slide, [field]: value } : slide,
      ),
    );
  };

  /* ================= IMAGE ================= */
  const handleImageSelect = (index, type, file) => {
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setSlides((prev) =>
      prev.map((slide, i) => {
        if (i !== index) return slide;

        if (type === "main") {
          return { ...slide, mainImage: preview, mainFile: file };
        }

        return { ...slide, pngImage: preview, pngFile: file };
      }),
    );
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

  /* ================= CHANGE DETECT ================= */
  const hasChanges = () => {
    return (
      JSON.stringify(
        slides.map((s) => ({
          title: s.title,
          paragraph: s.paragraph,
          mainImage: s.mainImage,
          pngImage: s.pngImage,
          color: s.color,
        })),
      ) !==
      JSON.stringify(
        initialSlides.map((s) => ({
          title: s.title,
          paragraph: s.paragraph,
          mainImage: s.mainImage,
          pngImage: s.pngImage,
          color: s.color,
        })),
      )
    );
  };

  /* ================= SAVE ================= */
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
            const uploaded = await uploadImage(slide.mainFile);
            mainImage = uploaded.url;
            main_public_id = uploaded.public_id;
          }

          if (slide.pngFile) {
            const uploaded = await uploadImage(slide.pngFile);
            pngImage = uploaded.url;
            png_public_id = uploaded.public_id;
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

      await api.put("/settings/store/slider", {
        slides: updatedSlides,
      });

      setSlides(updatedSlides);
      setInitialSlides(updatedSlides);

      toast.success("Slider updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout
      title="Homepage Slider"
      description="Manage homepage slides"
      className="max-w-lg"
    >
      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
          >
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-[#f1ebe3] flex items-center gap-3">
              <Images size={22} className="text-primary" />

              <div>
                <p className="text-[11px] tracking-[0.35em] uppercase text-neutral-400">
                  Slide {index + 1}
                </p>
                <h2 className="mt-1 text-2xl font-cormorant">Homepage Slide</h2>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* MAIN IMAGE */}
              <div>
                <label className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
                  Main Image
                </label>

                <div className="mt-3 relative h-52 bg-[#faf7f2] border border-dashed rounded-md flex items-center justify-center overflow-hidden">
                  {slide.mainImage ? (
                    <img
                      src={slide.mainImage}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImagePlus className="text-neutral-400" />
                  )}

                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) =>
                      handleImageSelect(index, "main", e.target.files[0])
                    }
                  />
                </div>
              </div>

              {/* PNG IMAGE */}
              <div>
                <label className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
                  PNG Image
                </label>

                <div className="mt-3 relative h-40 bg-[#faf7f2] border border-dashed rounded-md flex items-center justify-center overflow-hidden">
                  {slide.pngImage ? (
                    <img
                      src={slide.pngImage}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImagePlus className="text-neutral-400" />
                  )}

                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) =>
                      handleImageSelect(index, "png", e.target.files[0])
                    }
                  />
                </div>
              </div>

              {/* TITLE */}
              <input
                value={slide.title}
                onChange={(e) => handleChange(index, "title", e.target.value)}
                placeholder="Slide Title"
                className="w-full h-14 px-5 border rounded-md"
              />

              {/* PARAGRAPH */}
              <textarea
                rows={4}
                value={slide.paragraph}
                onChange={(e) =>
                  handleChange(index, "paragraph", e.target.value)
                }
                placeholder="Slide Paragraph"
                className="w-full px-5 py-4 border rounded-md"
              />

              {/* 🎨 COLOR */}
              <div>
                <label className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
                  Slide Color
                </label>

                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="color"
                    value={slide.color || "#000000"}
                    onChange={(e) =>
                      handleChange(index, "color", e.target.value)
                    }
                    className="w-16 h-12 border rounded-md"
                  />

                  <span className="text-sm text-neutral-500">
                    {slide.color || "#000000"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* SAVE */}
        <button
          onClick={handleSave}
          disabled={loading || !hasChanges()}
          className="h-14 w-full bg-primary text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Saving
            </>
          ) : (
            <>
              <Save />
              Save Slides
            </>
          )}
        </button>
      </div>
    </SettingsLayout>
  );
};

export default SliderSettings;
