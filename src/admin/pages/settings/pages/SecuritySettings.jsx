import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, X } from "lucide-react";
import api from "../../../api/api";
import SettingsLayout from "../components/SettingsLayout";

const SecuritySettings = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [errors, setErrors] = useState({});

  const [modal, setModal] = useState({
    type: "",
    message: "",
  });

  const handlePasswordChange = async () => {
    let newErrors = {};

    // VALIDATION
    if (!oldPassword.trim()) {
      newErrors.oldPassword = "Current password is required";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    }

    setErrors(newErrors);

    // STOP REQUEST
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await api.put("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      setOldPassword("");
      setNewPassword("");

      setModal({
        type: "success",
        message: res.data.message || "Password updated successfully",
      });

      setTimeout(() => {
        setModal({
          type: "",
          message: "",
        });
      }, 3000);
    } catch (err) {
      setModal({
        type: "error",
        message: err.response?.data?.message || "Something went wrong",
      });

      setTimeout(() => {
        setModal({
          type: "",
          message: "",
        });
      }, 3000);
    }
  };

  return (
    <SettingsLayout
      title="Admin Security"
      description="Update your password securely"
    >
      {/* MODAL */}
      {modal.type && (
        <div
          className="
          fixed inset-0
          flex items-center justify-center
          bg-black/30 z-50
        "
        >
          <div
            className="
            bg-white
            w-[260px] h-[220px]
            rounded-3xl
            flex flex-col items-center justify-center
            shadow-xl
          "
          >
            {modal.type === "success" ? (
              <CheckCircle2 size={60} className="text-green-500" />
            ) : (
              <X size={60} className="text-red-500" />
            )}

            <p
              className="
              mt-4
              font-cormorant
              text-lg
              text-gray-700
              text-center
              px-4
            "
            >
              {modal.message}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5 max-w-md">
        {/* OLD PASSWORD */}
        <div>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  oldPassword: "",
                }));
              }}
              className="
                w-full h-[48px]
                px-4 pr-10
                rounded-2xl
                bg-[#faf7f2]
                border border-[#e7dcc7]
                outline-none
              "
            />

            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="
                absolute right-3
                top-1/2 -translate-y-1/2
              "
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.oldPassword && (
            <p
              className="
              text-red-500
              text-sm
              mt-1
              font-cormorant
            "
            >
              {errors.oldPassword}
            </p>
          )}
        </div>

        {/* NEW PASSWORD */}
        <div>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  newPassword: "",
                }));
              }}
              className="
                w-full h-[48px] flex
                px-4 pr-10
                rounded-2xl
                bg-[#faf7f2]
                border border-[#e7dcc7]
                outline-none  
              "
            />

            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="
                absolute right-3
                top-1/2 -translate-y-1/2
              "
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.newPassword && (
            <p
              className="
              text-red-500
              text-sm
              mt-1
              font-cormorant
            "
            >
              {errors.newPassword}
            </p>
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={handlePasswordChange}
          className="
            w-full h-[48px]
            bg-primary
            text-white
            rounded-2xl
            hover:opacity-90
            transition
          "
        >
          Update Password
        </button>
      </div>
    </SettingsLayout>
  );
};

export default SecuritySettings;
