import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SettingsLayout = ({ title, description, children }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* TOP BAR */}
      <div className="flex items-center gap-4">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/admin/settings")}
          className="
            w-11 h-11
            rounded-2xl
            border border-[#e7dcc7]
            bg-white
            flex items-center justify-center
            hover:bg-[#faf7f2]
            transition
          "
        >
          <ArrowLeft size={20} />
        </button>

        {/* TITLE */}
        <div>
          <h1 className="font-luxury text-3xl lg:text-5xl text-gray-800">
            {title}
          </h1>

          <p className="font-cormorant text-lg text-gray-500 mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white w-full max-w-lg border border-[#e7dcc7] rounded-[32px] p-5 lg:p-8 -z-10">
        {children}
      </div>
    </div>
  );
};

export default SettingsLayout;
