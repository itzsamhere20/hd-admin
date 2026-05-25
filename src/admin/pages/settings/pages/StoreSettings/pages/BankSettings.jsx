import { useEffect, useState } from "react";
import {
  Landmark,
  User2,
  CreditCard,
  MessageCircle,
  Save,
  Loader2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import SettingsLayout from "../../../components/SettingsLayout";
import api from "../../../../../api/api";

const initialState = {
  bankName: "",
  accountTitle: "",
  accountNumber: "",
  whatsappNumber: "",
};

const BankSettings = () => {
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState(initialState);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchBank = async () => {
      try {
        const { data } = await api.get("/settings/store/bank");
        setForm(data || initialState);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBank();
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
        bankName: form.bankName || "",
        accountTitle: form.accountTitle || "",
        accountNumber: form.accountNumber || "",
        whatsappNumber: form.whatsappNumber || "",
      };

      await api.put("/settings/store/bank", payload);

      setForm(payload);
      setDirty(false);

      toast.success("Bank details updated");
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
      title="Bank Information"
      description="Manage payment information"
    >
      <div className="bg-white border border-[#ece7df] rounded-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#f1ebe3] flex items-center gap-4">
          <Landmark size={24} className="text-primary" />

          <div>
            <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
              Payments
            </p>
            <h2 className="mt-2 text-4xl font-cormorant">Bank Details</h2>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-7 space-y-6">
          {/* BANK NAME */}
          <div className="relative">
            <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              placeholder="Bank Name"
              className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
            />
          </div>

          {/* ACCOUNT TITLE */}
          <div className="relative">
            <User2 className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              name="accountTitle"
              value={form.accountTitle}
              onChange={handleChange}
              placeholder="Account Title"
              className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
            />
          </div>

          {/* ACCOUNT NUMBER */}
          <div className="relative">
            <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              placeholder="Account Number"
              className="w-full h-14 pl-14 pr-5 rounded-md border border-[#ece7df] outline-none focus:border-primary"
            />
          </div>

          {/* WHATSAPP */}
          <div className="relative">
            <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              name="whatsappNumber"
              value={form.whatsappNumber}
              onChange={handleChange}
              placeholder="WhatsApp Number"
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
                  Save Information
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

export default BankSettings;
