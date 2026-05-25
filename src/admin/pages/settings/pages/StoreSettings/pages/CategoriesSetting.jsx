import { useEffect, useState } from "react";
import { Shapes, Save, Loader2, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";

import SettingsLayout from "../../../components/SettingsLayout";
import api from "../../../../../api/api";

const HomepageCategoriesSettings = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [featured, setFeatured] = useState([]);
  const [initialFeatured, setInitialFeatured] = useState([]);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes] = await Promise.all([
          api.get("/categories"),
          api.get("/settings/store/featured-categories"),
        ]);

        const normalized = featRes.data?.featuredCategories || [];

        setCategories(catRes.data);
        setFeatured(normalized);
        setInitialFeatured(normalized);
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchData();
  }, []);

  /* ================= TOGGLE ================= */
  const toggleCategory = (category) => {
    setFeatured((prev) => {
      const exists = prev.find((f) => f.categoryId === category._id);

      if (exists) {
        // 🔥 ONLY toggle active — DO NOT remove item
        return prev.map((item) =>
          item.categoryId === category._id
            ? { ...item, active: !item.active }
            : item,
        );
      }

      // new featured item
      return [
        ...prev,
        {
          categoryId: category._id,
          homepageImage: category.image,
          public_id: "",
          active: true,
        },
      ];
    });
  };

  /* ================= IMAGE CHANGE ================= */
  const handleImageChange = (file, categoryId) => {
    const preview = URL.createObjectURL(file);

    setFeatured((prev) =>
      prev.map((item) =>
        item.categoryId === categoryId
          ? {
              ...item,
              homepageImage: preview,
              file,
            }
          : item,
      ),
    );
  };

  /* ================= HAS CHANGES ================= */
  const hasChanges = () => {
    return JSON.stringify(featured) !== JSON.stringify(initialFeatured);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setLoading(true);

      const formatted = await Promise.all(
        featured.map(async (item) => {
          let homepageImage = item.homepageImage;
          let public_id = item.public_id || "";

          // upload new image if exists
          if (item.file) {
            const formData = new FormData();
            formData.append("image", item.file);

            const res = await api.post("/upload", formData, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });

            homepageImage = res.data.url;

            // IMPORTANT: keep old id for deletion tracking
            item.old_public_id = item.public_id;

            public_id = res.data.public_id;
          }

          return {
            categoryId: item.categoryId,
            homepageImage,
            public_id,
            old_public_id: item.old_public_id || item.public_id || "",
            active: item.active,
          };
        }),
      );

      await api.put("/settings/store/featured-categories", {
        featuredCategories: formatted,
      });

      setFeatured(formatted);
      setInitialFeatured(formatted);

      toast.success("Updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CLEAR ================= */
  const handleClear = () => {
    setFeatured([]);
    toast.success("Cleared");
  };

  return (
    <SettingsLayout
      title="Homepage Categories"
      description="Choose featured categories"
      className="max-w-lg"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden">
        {/* HEADER */}
        <div className="px-7 py-6 border-b flex items-center gap-4">
          <Shapes size={24} className="text-primary" />
          <h2 className="text-3xl font-cormorant">Featured Categories</h2>
        </div>

        {/* LIST */}
        <div className="p-7 space-y-5">
          {categories.map((category) => {
            const item = featured.find((f) => f.categoryId === category._id);

            const isActive = item?.active;

            return (
              <div key={category._id} className="border p-4 rounded-md">
                {/* IMAGE */}
                <div className="relative h-40 bg-[#faf7f2] flex items-center justify-center overflow-hidden rounded-md">
                  {item?.homepageImage ? (
                    <img
                      src={item.homepageImage}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="text-gray-400" />
                  )}

                  {item && (
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        handleImageChange(e.target.files[0], category._id)
                      }
                    />
                  )}
                </div>

                {/* INFO */}
                <div className="flex justify-between mt-3">
                  <h3 className="font-cormorant text-xl">{category.name}</h3>

                  <input
                    type="checkbox"
                    checked={!!isActive}
                    onChange={() => toggleCategory(category)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTIONS */}
        <div className="px-7 pb-7 flex gap-3">
          {/* SAVE */}
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges()}
            className="h-14 flex-1 bg-primary text-white uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save size={18} />
                Save
              </>
            )}
          </button>

          {/* CLEAR */}
          <button
            onClick={handleClear}
            className="h-14 px-6 border border-[#ece7df] rounded-none uppercase tracking-[0.25em] text-xs text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default HomepageCategoriesSettings;
