import { useState } from "react";
import { ImagePlus, Save, Loader2, Type, AlignLeft } from "lucide-react";

import SettingsLayout from "../../../components/SettingsLayout";

const LandingSettings = () => {
  const [loading, setLoading] = useState(false);

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

            <div className="mt-3 border border-dashed border-[#d8cfc3] rounded-md h-[220px] flex items-center justify-center bg-[#faf7f2]">
              <div className="text-center">
                <ImagePlus className="mx-auto text-neutral-400" size={30} />

                <p className="mt-3 text-sm text-neutral-500">
                  Upload Landing Image
                </p>
              </div>
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
                placeholder="Luxury Jewellery"
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
              placeholder="Timeless Elegance"
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
                rows={5}
                placeholder="Write landing section description..."
                className="w-full pl-14 pr-5 py-4 rounded-md border border-[#ece7df] outline-none resize-none focus:border-primary"
              />
            </div>
          </div>

          {/* SAVE */}
          <button
            disabled={loading}
            className="
              h-14
              px-8
              bg-primary
              text-white
              uppercase
              tracking-[0.2em]
              text-sm
              flex
              items-center
              gap-2
            "
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
        </div>
      </div>
    </SettingsLayout>
  );
};

export default LandingSettings;
