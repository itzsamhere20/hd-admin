import { useState } from "react";
import SettingsLayout from "../components/SettingsLayout";

const PromoSettings = () => {
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState("");

  return (
    <SettingsLayout
      title="Promo Codes"
      description="Create and manage promotional discount codes"
    >
      <div className="space-y-5">
        <input
          type="text"
          placeholder="Promo Code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
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
          placeholder="Discount Percentage"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
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
          Add Promo Code
        </button>
      </div>
    </SettingsLayout>
  );
};

export default PromoSettings;
