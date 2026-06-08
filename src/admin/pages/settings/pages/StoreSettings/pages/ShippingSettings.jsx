/* =========================================================
   SHIPPING SETTINGS PAGE (AUTO EDIT + DIRTY SAVE STATE)
========================================================= */

import { useEffect, useState } from "react";
import { Loader2, Save, Truck, Wallet, BadgeDollarSign } from "lucide-react";

import api from "../../../../../api/api";
import SettingsLayout from "../../../components/SettingsLayout";

/* ── STYLE (same system as other pages) ── */
const INPUT =
  "w-full h-[50px] border border-[#e7dcc7] rounded-2xl pl-11 pr-4 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors";

const LABEL = "text-xs text-gray-400 uppercase tracking-widest mb-2 block";

const ShippingSettings = () => {
  const [threshold, setThreshold] = useState("");
  const [shippingFee, setShippingFee] = useState("");

  const [initial, setInitial] = useState({ threshold: "", fee: "" });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");

  /* =========================================================
     LOAD SETTINGS
  ========================================================= */
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/settings/store/shipping");

      const data = {
        threshold: res.data.freeShippingThreshold || 0,
        fee: res.data.shippingFee || 0,
      };

      setThreshold(data.threshold);
      setShippingFee(data.fee);
      setInitial(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     DIRTY CHECK (like other pages)
  ========================================================= */
  const isDirty =
    Number(threshold) !== Number(initial.threshold) ||
    Number(shippingFee) !== Number(initial.fee);

  const isDisabled = saving || loading || !isDirty;

  /* =========================================================
     SAVE SETTINGS
  ========================================================= */
  const saveSettings = async () => {
    if (!isDirty) return;

    try {
      setSaving(true);

      await api.put("/settings/store/shipping", {
        freeShippingThreshold: Number(threshold),
        shippingFee: Number(shippingFee),
      });

      setInitial({
        threshold: Number(threshold),
        fee: Number(shippingFee),
      });

      setSuccess("Shipping settings updated successfully");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="Shipping Settings"
      description="Manage delivery fees and free shipping rules"
    >
      {/* OUTER CARD */}
      <div className="bg-white border border-[#e7dcc7] rounded-3xl overflow-hidden w-full">
        {/* HEADER */}
        <div className="px-7 py-6 border-b border-[#e7dcc7] flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center text-gray-500">
            <Truck size={18} />
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Store Delivery
            </p>
            <h2 className="font-luxury text-2xl text-gray-800 mt-0.5">
              Shipping Rules
            </h2>
          </div>
        </div>

        {/* BODY */}
        <div className="px-7 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#e7dcc7] border-t-gray-800 animate-spin" />
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Loading...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* THRESHOLD */}
              <div>
                <label className={LABEL}>Free Shipping Threshold</label>

                <div className="relative">
                  <BadgeDollarSign
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  />

                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder="5000"
                    className={INPUT}
                  />
                </div>
              </div>

              {/* SHIPPING FEE */}
              <div>
                <label className={LABEL}>Standard Shipping Fee</label>

                <div className="relative">
                  <Wallet
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  />

                  <input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    placeholder="300"
                    className={INPUT}
                  />
                </div>
              </div>

              {/* SUCCESS */}
              {success && (
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
                  {success}
                </div>
              )}

              {/* SAVE BUTTON (ONLY) */}
              <button
                onClick={saveSettings}
                disabled={isDisabled}
                className="w-full h-[50px] rounded-2xl bg-primary text-white text-sm flex items-center justify-center gap-2 hover:opacity-80 transition disabled:opacity-40"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </SettingsLayout>
  );
};

export default ShippingSettings;
