import { useState } from "react";
import {
  Landmark,
  User2,
  CreditCard,
  MessageCircle,
  Save,
  Loader2,
} from "lucide-react";

import SettingsLayout from "../../../components/SettingsLayout";

const BankSettings = () => {
  const [loading, setLoading] = useState(false);

  return (
    <SettingsLayout
      title="Bank Information"
      description="Manage payment information"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        <div className="px-7 py-6 border-b border-[#f1ebe3] flex items-center gap-4">
          <div className="w-14 h-14 bg-[#faf7f2] border border-[#ece7df] flex items-center justify-center">
            <Landmark size={24} className="text-primary" />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
              Payments
            </p>

            <h2 className="mt-2 text-4xl font-cormorant">Bank Details</h2>
          </div>
        </div>

        <div className="p-7 space-y-6">
          <div className="relative">
            <Landmark
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              placeholder="Bank Name"
              className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none"
            />
          </div>

          <div className="relative">
            <User2
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              placeholder="Account Title"
              className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none"
            />
          </div>

          <div className="relative">
            <CreditCard
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              placeholder="Account Number"
              className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none"
            />
          </div>

          <div className="relative">
            <MessageCircle
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              placeholder="WhatsApp Number"
              className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none"
            />
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
                Save Information
              </>
            )}
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default BankSettings;
