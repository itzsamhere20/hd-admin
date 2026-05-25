import { useEffect, useState } from "react";
import { Phone, Mail, Save, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import SettingsLayout from "../../../components/SettingsLayout";
import api from "../../../../../api/api";

const initialState = {
  phone: "",
  email: "",
};

const ContactSettings = () => {
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState(initialState);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await api.get("/settings/store/contact");
        setForm(data || initialState);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchContact();
  }, []);

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (initialLoading || !dirty) return;

    try {
      setLoading(true);

      const payload = {
        phone: form.phone || "",
        email: form.email || "",
      };

      await api.put("/settings/store/contact", payload);

      setForm(payload);
      setDirty(false);

      toast.success("Contact updated");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CLEAR ================= */
  const handleClear = () => {
    setForm(initialState);
    setDirty(true);
  };

  const isDisabled = loading || !dirty || initialLoading;

  return (
    <SettingsLayout
      title="Contact Details"
      description="Manage store contact information"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#f1ebe3]">
          <h2 className="text-4xl font-cormorant">Contact Information</h2>
        </div>

        {/* CONTENT */}
        <div className="p-7 space-y-6">
          {/* PHONE */}
          <div className="relative">
            <Phone
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
            />
          </div>

          {/* EMAIL */}
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">
            {/* SAVE */}
            <button
              onClick={handleSave}
              disabled={isDisabled}
              className="h-14 px-8 bg-primary text-white uppercase tracking-[0.2em] text-sm flex items-center gap-2 disabled:opacity-50"
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

            {/* CLEAR */}
            <button
              onClick={handleClear}
              disabled={loading}
              className="h-14 px-6 border border-[#ece7df] text-gray-600 uppercase tracking-[0.2em] text-sm"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default ContactSettings;
