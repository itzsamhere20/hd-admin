import { useState } from "react";
import { Images, Plus, Pencil, Trash2, Save, Loader2 } from "lucide-react";

import SettingsLayout from "../../../components/SettingsLayout";

const SliderSettings = () => {
  const [loading, setLoading] = useState(false);

  const slides = [1, 2, 3];

  return (
    <SettingsLayout
      title="Homepage Slider"
      description="Manage homepage slides"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className="h-14 px-8 bg-primary text-white uppercase tracking-[0.2em] text-sm flex items-center gap-2">
            <Plus size={18} />
            Add Slide
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
            >
              <div className="aspect-[16/8] bg-[#faf7f2] flex items-center justify-center">
                <Images size={30} className="text-neutral-400" />
              </div>

              <div className="p-6 space-y-4">
                <input
                  placeholder="Slide Title"
                  className="w-full h-14 px-5 rounded-md border border-[#ece7df] outline-none"
                />

                <textarea
                  rows={4}
                  placeholder="Slide Paragraph"
                  className="w-full px-5 py-4 rounded-md border border-[#ece7df] outline-none resize-none"
                />

                <div className="flex gap-3">
                  <button className="flex-1 h-12 border border-[#ece7df] flex items-center justify-center gap-2 text-sm uppercase tracking-[0.15em]">
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button className="w-12 h-12 border border-red-200 text-red-500 flex items-center justify-center">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
              Save Slides
            </>
          )}
        </button>
      </div>
    </SettingsLayout>
  );
};

export default SliderSettings;
