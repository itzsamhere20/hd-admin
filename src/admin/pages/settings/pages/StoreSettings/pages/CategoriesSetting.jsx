import { useState } from "react";
import { Shapes, Save, Loader2 } from "lucide-react";

import SettingsLayout from "../../../components/SettingsLayout";

const categories = [
  {
    _id: 1,
    name: "Necklaces",
    image: "https://via.placeholder.com/300",
    homepage: true,
  },
  {
    _id: 2,
    name: "Bracelets",
    image: "https://via.placeholder.com/300",
    homepage: false,
  },
];

const HomepageCategoriesSettings = () => {
  const [loading, setLoading] = useState(false);

  return (
    <SettingsLayout
      title="Homepage Categories"
      description="Choose featured categories for homepage"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        <div className="px-7 py-6 border-b border-[#f1ebe3] flex items-center gap-4">
          <div className="w-14 h-14 bg-[#faf7f2] border border-[#ece7df] flex items-center justify-center">
            <Shapes size={24} className="text-primary" />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
              Homepage
            </p>

            <h2 className="mt-2 text-4xl font-cormorant">
              Featured Categories
            </h2>
          </div>
        </div>

        <div className="p-7 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((category) => (
            <div
              key={category._id}
              className="border border-[#ece7df] rounded-md overflow-hidden"
            >
              <div className="aspect-square bg-[#faf7f2]">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="font-cormorant text-xl">{category.name}</h3>

                <label className="flex items-center gap-3 mt-4 text-sm text-neutral-600">
                  <input type="checkbox" defaultChecked={category.homepage} />
                  Show on Homepage
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="px-7 pb-7">
          <button
            disabled={loading}
            className="h-14 px-8 bg-primary text-white uppercase tracking-[0.2em] text-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save size={18} />
                Save Categories
              </>
            )}
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default HomepageCategoriesSettings;
