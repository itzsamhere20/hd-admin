import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import api from "../../../api/api";
import SettingsLayout from "../components/SettingsLayout";

const ProfileSettings = () => {
  const token = localStorage.getItem("token");

  const [admin, setAdmin] = useState(null);

  const [panel, setPanel] = useState(null); // "name" | "email"
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  const [nameInput, setNameInput] = useState("");

  const [emailInput, setEmailInput] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState("password");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [toast, setToast] = useState({ type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3000);
  };

  useEffect(() => {
    const fetchAdmin = async () => {
      const res = await api.get("/auth/me");
      setAdmin(res.data);
    };
    fetchAdmin();
  }, []);

  useEffect(() => {
    let interval;

    if (panel === "email" && step === "otp" && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [panel, step, canResend]);

  // ================= NAME =================
  const updateName = async () => {
    if (!nameInput.trim()) return showToast("error", "Name cannot be empty");

    try {
      setLoading(true);

      const res = await api.put(
        "/auth/change-name",
        { name: nameInput },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setAdmin(res.data.admin);
      setPanel(null);

      showToast("success", "Name updated successfully");
    } catch {
      showToast("error", "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  // ================= PASSWORD CHECK  =================
  const verifyPassword = async () => {
    try {
      setOtpError("");
      await api.post(
        "/auth/verify-password",
        { password },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setStep("email");
    } catch {
      setOtpError("Incorrect password");
    }
  };

  // ================= SEND OTP =================
  const sendOtp = async () => {
    try {
      setSendingOtp(true);
      setOtpError("");

      await api.post(
        "/auth/send-email-otp",
        {
          newEmail: emailInput,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setCanResend(false);
      setResendTimer(30);
      setStep("otp");
      showToast("success", `OTP sent to ${emailInput}`);
    } catch {
      showToast("error", "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // ================= RESEND OTP =================
  const resendOtp = async () => {
    setOtpError("");
    setOtp("");
    try {
      setResendingOtp(true);

      await api.post(
        "/auth/send-email-otp",
        {
          newEmail: emailInput,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setCanResend(false);
      setResendTimer(30);
    } catch {
      setOtpError("Failed to resend OTP");
    } finally {
      setResendingOtp(false);
    }
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async () => {
    try {
      setVerifyingOtp(true);

      const res = await api.put(
        "/auth/verify-email-otp",
        { otp: otp.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setAdmin((prev) => ({
        ...prev,
        email: emailInput,
      }));

      setPanel(null);
      setStep("password");
      setOtp("");

      showToast("success", "Email updated successfully");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (!admin) return null;

  return (
    <SettingsLayout
      title="Profile Settings"
      description="Manage your account securely"
    >
      {toast.type && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`px-4 py-3 rounded-xl text-white shadow-lg ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* CARDS (UNCHANGED DESIGN) */}
      <div className="max-w-md space-y-4">
        <div className="bg-white duration-300 ease-in-out hover:bg-primary/10 border rounded-2xl p-5 flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <h2 className="text-lg font-cormorant">{admin.name}</h2>
          </div>

          <button
            onClick={() => {
              setPanel("name");
              setNameInput(admin.name);
            }}
            className="text-primary font-medium"
          >
            Edit
          </button>
        </div>

        <div className="bg-white hover:bg-primary/10 ease-in-out duration-300 border rounded-2xl p-5 flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <h2 className="text-lg font-cormorant">{admin.email}</h2>
          </div>

          <button
            onClick={() => {
              setPanel("email");
              setStep("password");
              setPassword("");
              setEmailInput("");
              setOtp("");
              setOtpError("");
            }}
            className="text-primary font-medium"
          >
            Edit
          </button>
        </div>
      </div>

      {/* SIDE PANEL (UNCHANGED DESIGN) */}
      {panel && (
        <div className="fixed right-0 top-0 h-full w-[380px] bg-white shadow-2xl z-50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setPanel(null)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold">
              {panel === "name" ? "Edit Name" : "Change Email"}
            </h2>
          </div>

          {/* NAME */}
          {panel === "name" && (
            <div className="space-y-4">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full h-[45px] px-4 rounded-xl bg-[#faf7f2] border"
              />

              <button
                onClick={updateName}
                disabled={loading}
                className={`w-full h-[45px] rounded-xl text-white ${
                  loading ? "bg-gray-400" : "bg-primary"
                }`}
              >
                {loading ? "Saving..." : "Save Name"}
              </button>
            </div>
          )}

          {/* EMAIL FLOW */}
          {panel === "email" && (
            <div className="space-y-4">
              {/* PASSWORD STEP */}
              {step === "password" && (
                <>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full h-[45px] px-4 rounded-xl bg-[#faf7f2] border"
                  />

                  {otpError && (
                    <p className="text-red-500 text-sm">{otpError}</p>
                  )}

                  <button
                    onClick={verifyPassword}
                    className="w-full h-[45px] bg-primary text-white rounded-xl"
                  >
                    Continue
                  </button>
                </>
              )}

              {/* EMAIL STEP */}
              {step === "email" && (
                <>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setOtpError("");
                    }}
                    className="w-full h-[45px] px-4 rounded-xl bg-[#faf7f2] border"
                    placeholder="Enter new email"
                  />

                  {otpError && (
                    <p className="text-red-500 text-sm">{otpError}</p>
                  )}

                  <button
                    onClick={() => {
                      const email = emailInput.trim();

                      if (!email) {
                        setOtpError("Email cannot be empty");
                        return;
                      }

                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                      if (!emailRegex.test(email)) {
                        setOtpError("Invalid email format");
                        return;
                      }
                      if (admin?.email === email) {
                        setOtpError("Please use a different email address");
                        return;
                      }

                      setOtpError("");

                      // proceed
                      setStep("confirmEmail");
                    }}
                    className="w-full h-[45px] bg-primary text-white rounded-xl"
                  >
                    Continue
                  </button>
                </>
              )}

              {/* CONFIRM EMAIL STEP */}
              {step === "confirmEmail" && (
                <>
                  <p className="text-sm text-gray-500">
                    You are about to change email to:
                  </p>
                  <div className="flex w-full justify-between ">
                    <p className="font-semiold pr-3">{emailInput}</p>
                    <button
                      onClick={() => {
                        setStep("email");
                        setOtp("");
                        setOtpError("");
                      }}
                      className=" text-xs text-gray-500 underline"
                    >
                      Change Email
                    </button>
                  </div>
                  <button
                    onClick={sendOtp}
                    disabled={sendingOtp}
                    className="w-full h-[45px] bg-primary text-white rounded-xl"
                  >
                    {sendingOtp ? "Sending..." : "Send OTP"}
                  </button>
                </>
              )}

              {/* OTP STEP */}
              {step === "otp" && (
                <>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full h-[45px] px-4 rounded-xl bg-[#faf7f2] border"
                  />

                  {otpError && (
                    <p className="text-red-500 text-sm">{otpError}</p>
                  )}

                  <button
                    onClick={verifyOtp}
                    disabled={verifyingOtp}
                    className="w-full h-[45px] bg-primary text-white rounded-xl"
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                  <p className="text-sm text-gray-500">
                    OTP sent to:
                    <div className="flex w-full justify-between">
                      <b>{emailInput}</b>{" "}
                      <button
                        onClick={() => {
                          setStep("email");
                          setOtpError("");
                          setOtp("");
                        }}
                        className="text-xs text-primary underline"
                      >
                        Change Email
                      </button>
                    </div>
                  </p>

                  <div className="text-center text-sm mt-2">
                    {canResend ? (
                      <button
                        onClick={resendOtp}
                        disabled={resendingOtp}
                        className="text-primary font-medium"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <p className="text-gray-500">Resend in {resendTimer}s</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </SettingsLayout>
  );
};

export default ProfileSettings;
