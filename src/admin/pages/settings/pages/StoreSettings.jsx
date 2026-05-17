import { useState } from "react";
import SettingsLayout from "../components/SettingsLayout";

const StoreSettings = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <SettingsLayout
      title="Store Information"
      description="Manage contact information for your website"
    >
      <div className="space-y-5">
        <input
          type="email"
          placeholder="Store Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-[56px] rounded-2xl px-5 bg-[#faf7f2] border border-[#e7dcc7] outline-none"
        />

        <input
          type="text"
          placeholder="Store Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full h-[56px] rounded-2xl px-5 bg-[#faf7f2] border border-[#e7dcc7] outline-none"
        />

        <button className="h-[56px] px-8 rounded-2xl bg-primary text-white">
          Save Changes
        </button>
      </div>
    </SettingsLayout>
  );
};

export default StoreSettings;
