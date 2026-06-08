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

/* ── STYLE (same as ContactSettings) ── */
const INPUT =
  "w-full h-[50px] border border-[#e7dcc7] rounded-2xl pl-11 pr-4 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors";

const LABEL = "text-xs text-gray-400 uppercase tracking-widest mb-2 block";

/* ── ICON INPUT ── */
const IconInput = ({
  icon: Icon,
  label,
  name,
  placeholder,
  type = "text",
  value,
  onChange,
}) => (
  <div>
    <label className={LABEL}>{label}</label>

    <div className="relative">
      <Icon
        size={15}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
      />

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={INPUT}
      />
    </div>
  </div>
);

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
      {/* OUTER CARD */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden w-full">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#e7dcc7] flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center text-gray-500 shrink-0">
            <Landmark size={18} />
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Payments
            </p>
            <h2 className="font-luxury text-2xl text-gray-800 mt-0.5">
              Bank Details
            </h2>
          </div>
        </div>

        {/* BODY */}
        <div className="px-7 py-6">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#e7dcc7] border-t-gray-800 animate-spin" />
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Loading...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <IconInput
                icon={Landmark}
                label="Bank Name"
                name="bankName"
                placeholder="Enter bank name"
                value={form.bankName}
                onChange={handleChange}
              />

              <IconInput
                icon={User2}
                label="Account Title"
                name="accountTitle"
                placeholder="Enter account title"
                value={form.accountTitle}
                onChange={handleChange}
              />

              <IconInput
                icon={CreditCard}
                label="Account Number"
                name="accountNumber"
                placeholder="Enter account number"
                value={form.accountNumber}
                onChange={handleChange}
              />

              <IconInput
                icon={MessageCircle}
                label="WhatsApp Number"
                name="whatsappNumber"
                placeholder="+92 3XX XXXXXXX"
                value={form.whatsappNumber}
                onChange={handleChange}
              />

              {/* FOOTER BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isDisabled}
                  className="flex-1 h-[50px] rounded-2xl bg-primary text-white text-sm font-medium hover:opacity-80 transition disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Bank Info
                    </>
                  )}
                </button>

                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="h-[50px] px-5 rounded-2xl border border-[#e7dcc7] text-gray-500 hover:bg-[#faf7f2] transition disabled:opacity-40 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsLayout>
  );
};

export default BankSettings;
