import { useState } from "react";
import {
  LayoutPanelTop,
  ImagePlus,
  Palette,
  Save,
  Loader2,
} from "lucide-react";

import SettingsLayout from "../../../components/SettingsLayout";

const HeroSettings = () => {
  const [loading, setLoading] = useState(false);

  return (
    <SettingsLayout
      title="Hero Sections"
      description="Manage homepage promotional sections"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
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

        <div className="p-7 grid lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="space-y-5">
            <h3 className="text-xl font-cormorant">Left Section</h3>

            <div className="h-[220px] border border-dashed border-[#d8cfc3] rounded-md bg-[#faf7f2] flex items-center justify-center">
              <div className="text-center">
                <ImagePlus className="mx-auto text-neutral-400" size={28} />
                <p className="mt-3 text-sm text-neutral-500">
                  Upload Left Image
                </p>
              </div>
            </div>

            <input
              placeholder="Left Title"
              className="w-full h-14 px-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
            />

            <textarea
              rows={4}
              placeholder="Left Paragraph"
              className="w-full px-5 py-4 rounded-md border border-[#ece7df] outline-none resize-none focus:border-primary"
            />

            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase text-neutral-500 flex items-center gap-2 mb-3">
                <Palette size={14} />
                Left Background Color
              </label>

              <input
                type="color"
                className="w-full h-14 rounded-md border border-[#ece7df] bg-white"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <h3 className="text-xl font-cormorant">Right Section</h3>

            <div className="h-[220px] border border-dashed border-[#d8cfc3] rounded-md bg-[#faf7f2] flex items-center justify-center">
              <div className="text-center">
                <ImagePlus className="mx-auto text-neutral-400" size={28} />
                <p className="mt-3 text-sm text-neutral-500">
                  Upload Right Image
                </p>
              </div>
            </div>

            <input
              placeholder="Right Title"
              className="w-full h-14 px-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
            />

            <textarea
              rows={4}
              placeholder="Right Paragraph"
              className="w-full px-5 py-4 rounded-md border border-[#ece7df] outline-none resize-none focus:border-primary"
            />

            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase text-neutral-500 flex items-center gap-2 mb-3">
                <Palette size={14} />
                Right Background Color
              </label>

              <input
                type="color"
                className="w-full h-14 rounded-md border border-[#ece7df] bg-white"
              />
            </div>
          </div>
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default HeroSettings;
