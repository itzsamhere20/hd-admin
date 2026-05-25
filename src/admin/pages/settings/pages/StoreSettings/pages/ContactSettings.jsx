import { useState } from "react";
import { Phone, Mail, Save, Loader2 } from "lucide-react";

import SettingsLayout from "../../../components/SettingsLayout";

const ContactSettings = () => {
  const [loading, setLoading] = useState(false);

  return (
    <SettingsLayout
      title="Contact Details"
      description="Manage store contact information"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        <div className="px-7 py-6 border-b border-[#f1ebe3]">
          <h2 className="text-4xl font-cormorant">Contact Information</h2>
        </div>

        <div className="p-7 space-y-6">
          <div className="relative">
            <Phone
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              placeholder="Phone Number"
              className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none"
            />
          </div>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              placeholder="Email Address"
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
                Save Contact
              </>
            )}
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default ContactSettings;
