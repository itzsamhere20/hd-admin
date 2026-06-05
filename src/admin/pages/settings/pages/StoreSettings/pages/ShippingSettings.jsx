/* =========================================================
   SHIPPING SETTINGS PAGE
========================================================= */

import { useEffect, useState } from "react";
import {
  Loader2,
  Save,
  Truck,
  Wallet,
  PencilLine,
  BadgeDollarSign,
} from "lucide-react";

import api from "../../../../../api/api";
import SettingsLayout from "../../../components/SettingsLayout";

const ShippingSettings = () => {
  /* =========================================================
     STATES
  ========================================================= */
  const [threshold, setThreshold] = useState("");
  const [shippingFee, setShippingFee] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

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

      setThreshold(res.data.freeShippingThreshold || 0);

      setShippingFee(res.data.shippingFee || 0);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SAVE SETTINGS
  ========================================================= */
  const saveSettings = async () => {
    try {
      setSaving(true);

      await api.put("/settings/store/shipping", {
        freeShippingThreshold: Number(threshold),

        shippingFee: Number(shippingFee),
      });

      setSuccess("Shipping settings updated successfully");

      setEditing(false);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout
      title="Shipping Settings"
      description="Manage delivery fees and free shipping thresholds"
    >
      <div className="max-w-3xl">
        {/* CARD */}
        <div
          className="
            bg-white
            border
            border-[#ece7df]
            rounded-md
            overflow-hidden
            shadow-[0_10px_40px_rgba(0,0,0,0.04)]
          "
        >
          {/* HEADER */}
          <div className="px-7 py-6 border-b border-[#f1ebe3] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="
                  w-14
                  h-14
                  bg-[#faf7f2]
                  border
                  border-[#ece7df]
                  flex
                  items-center
                  justify-center
                "
              >
                <Truck size={24} className="text-primary" />
              </div>

              <div>
                <p className="text-[11px] tracking-[0.45em] uppercase text-neutral-400">
                  Store Delivery
                </p>

                <h2 className="mt-2 text-4xl font-cormorant">Shipping Rules</h2>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="
                  h-12
                  px-5
                  border
                  border-[#ece7df]
                  flex
                  items-center
                  gap-2
                  text-sm
                  tracking-[0.15em]
                  uppercase
                "
              >
                <PencilLine size={16} />
                Edit
              </button>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-7">
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* THRESHOLD */}
                <div>
                  <label className="text-[11px] tracking-[0.3em] uppercase text-neutral-500">
                    Free Shipping Threshold
                  </label>

                  <div className="relative mt-3">
                    <BadgeDollarSign
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      type="number"
                      disabled={!editing}
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      placeholder="5000"
                      className="
                        w-full
                        h-14
                        pl-14
                        pr-5
                        rounded-md
                        border
                        border-[#ece7df]
                        bg-white
                        outline-none
                        focus:border-primary
                        disabled:bg-[#fafafa]
                        disabled:text-neutral-500
                      "
                    />
                  </div>

                  <p className="mt-2 text-xs text-neutral-500">
                    Orders above this amount will receive free delivery.
                  </p>
                </div>

                {/* SHIPPING FEE */}
                <div>
                  <label className="text-[11px] tracking-[0.3em] uppercase text-neutral-500">
                    Standard Shipping Fee
                  </label>

                  <div className="relative mt-3">
                    <Wallet
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      type="number"
                      disabled={!editing}
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value)}
                      placeholder="300"
                      className="
                        w-full
                        h-14
                        pl-14
                        pr-5
                        rounded-md
                        border
                        border-[#ece7df]
                        bg-white
                        outline-none
                        focus:border-primary
                        disabled:bg-[#fafafa]
                        disabled:text-neutral-500
                      "
                    />
                  </div>

                  <p className="mt-2 text-xs text-neutral-500">
                    Applied automatically below threshold amount.
                  </p>
                </div>

                {/* SUCCESS */}
                {success && (
                  <div
                    className="
                      p-4
                      border
                      border-emerald-200
                      bg-emerald-50
                      text-emerald-700
                      text-sm
                    "
                  >
                    {success}
                  </div>
                )}

                {/* ACTIONS */}
                {editing && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setEditing(false);
                        fetchSettings();
                      }}
                      className="
                        h-14
                        px-8
                        border
                        border-[#ece7df]
                        uppercase
                        tracking-[0.2em]
                        text-sm
                      "
                    >
                      Cancel
                    </button>

                    <button
                      onClick={saveSettings}
                      disabled={saving}
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
                        disabled:opacity-70
                      "
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Settings
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default ShippingSettings;
