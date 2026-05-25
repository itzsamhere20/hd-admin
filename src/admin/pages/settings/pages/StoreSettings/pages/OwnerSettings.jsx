import { useState } from "react";
import { User2, ImagePlus, Save, Loader2 } from "lucide-react";

import SettingsLayout from "../../../components/SettingsLayout";

const OwnerSettings = () => {
  const [loading, setLoading] = useState(false);

  return (
    <SettingsLayout
      title="Owner Details"
      description="Manage owner information"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        <div className="px-7 py-6 border-b border-[#f1ebe3] flex items-center gap-4">
          <div className="w-14 h-14 bg-[#faf7f2] border border-[#ece7df] flex items-center justify-center">
            <User2 size={24} className="text-primary" />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
              Store Owner
            </p>

            <h2 className="mt-2 text-4xl font-cormorant">Owner Information</h2>
          </div>
        </div>

        <div className="p-7 space-y-6">
          <div className="h-[260px] border border-dashed border-[#d8cfc3] rounded-md bg-[#faf7f2] flex items-center justify-center">
            <div className="text-center">
              <ImagePlus className="mx-auto text-neutral-400" size={30} />
              <p className="mt-3 text-sm text-neutral-500">
                Upload Owner Image
              </p>
            </div>
          </div>

          <input
            placeholder="Owner Name"
            className="w-full h-14 px-5 rounded-md border border-[#ece7df] outline-none"
          />

          <textarea
            rows={5}
            placeholder="Owner Description"
            className="w-full px-5 py-4 rounded-md border border-[#ece7df] outline-none resize-none"
          />

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
                Save Details
              </>
            )}
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default OwnerSettings;
