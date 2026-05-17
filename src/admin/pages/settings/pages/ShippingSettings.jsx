import { useState } from "react";
import SettingsLayout from "../components/SettingsLayout";

const ShippingSettings = () => {
  const [threshold, setThreshold] = useState("");
  const [shippingFee, setShippingFee] = useState("");

  return (
    <SettingsLayout
      title="Shipping Settings"
      description="Manage shipping fees and free delivery thresholds"
    >
      <div className="space-y-5">
        <input
          type="number"
          placeholder="Free Shipping Threshold"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="
            w-full h-[56px]
            rounded-2xl
            px-5
            bg-[#faf7f2]
            border border-[#e7dcc7]
            outline-none
          "
        />

        <input
          type="number"
          placeholder="Standard Shipping Fee"
          value={shippingFee}
          onChange={(e) => setShippingFee(e.target.value)}
          className="
            w-full h-[56px]
            rounded-2xl
            px-5
            bg-[#faf7f2]
            border border-[#e7dcc7]
            outline-none
          "
        />

        <button
          className="
            h-[56px]
            px-8
            rounded-2xl
            bg-primary
            text-white
          "
        >
          Save Shipping Settings
        </button>
      </div>
    </SettingsLayout>
  );
};

export default ShippingSettings;
