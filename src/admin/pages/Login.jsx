import { Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const [step, setStep] = useState("login");
  // login | forgot | otp

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();

  // ================= COOLDOWN =================
  const startCooldown = () => {
    setResendCooldown(60);

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      toast.success("Welcome back Admin ✨");

      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND OTP =================
  const sendOtp = async () => {
    try {
      setLoading(true);

      await api.post("/auth/send-reset-otp", { email });

      toast.success("OTP sent to email");

      startCooldown();
      setStep("otp");
    } catch (err) {
      toast.error("Email not found");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const resendOtp = async () => {
    try {
      setResending(true);

      await api.post("/auth/send-reset-otp", { email });

      toast.success("OTP resent");

      startCooldown();
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  // ================= RESET PASSWORD =================
  const resetPassword = async () => {
    try {
      setLoading(true);

      await api.put("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      toast.success("Password updated");

      setStep("login");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      toast.error("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f3ea] via-[#faf7f2] to-[#f1e7d6] relative overflow-hidden">
      {/* floating glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#c9a86a]/20 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-[#b89255]/20 blur-3xl rounded-full bottom-[-120px] right-[-80px]" />

      {/* TOAST */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.85)",
            border: "1px solid #e7dcc7",
            borderRadius: "16px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          },
        }}
      />

      {/* CARD */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/70 backdrop-blur-2xl border border-[#e7dcc7] rounded-[42px] p-10 shadow-2xl">
          {/* HEADER */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a86a] to-[#b89255] flex items-center justify-center shadow-lg">
                <Shield className="text-white" />
              </div>
            </div>

            <h1 className="text-5xl font-luxury text-[#b89255] tracking-wide">
              Hamdam
            </h1>

            <p className="text-gray-500 font-cormorant text-lg mt-2">
              Secure Admin Access Portal
            </p>

            <div className="w-16 h-[2px] bg-[#c9a86a] mx-auto mt-4 opacity-40 rounded-full" />
          </div>

          {/* ================= LOGIN ================= */}
          {step === "login" && (
            <>
              <input
                className="input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative mt-4">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-12"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[25px] text-gray-500 hover:text-[#b89255] transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                disabled={loading}
                onClick={handleLogin}
                className="w-full mt-6 h-[56px] rounded-2xl text-white font-medium
                bg-gradient-to-r from-[#c9a86a] to-[#b89255]
                shadow-lg hover:shadow-xl transition active:scale-[0.98]"
              >
                {loading ? "Signing in..." : "Login to Dashboard"}
              </button>

              <p
                onClick={() => setStep("forgot")}
                className="text-center text-sm text-gray-500 mt-5 cursor-pointer hover:text-[#b89255]"
              >
                Forgot password?
              </p>
            </>
          )}

          {/* ================= FORGOT ================= */}
          {step === "forgot" && (
            <>
              <input
                className="input"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                disabled={loading}
                onClick={sendOtp}
                className="w-full mt-6 h-[56px] rounded-2xl text-white font-medium
                bg-gradient-to-r from-[#c9a86a] to-[#b89255]
                shadow-lg hover:shadow-xl transition"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <p
                onClick={() => setStep("login")}
                className="text-center text-sm text-gray-500 mt-5 cursor-pointer"
              >
                Back to login
              </p>
            </>
          )}

          {/* ================= OTP ================= */}
          {step === "otp" && (
            <>
              <input
                className="input"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <input
                className="input mt-4"
                placeholder="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button
                onClick={resetPassword}
                className="w-full mt-6 h-[56px] rounded-2xl text-white font-medium
                bg-gradient-to-r from-[#c9a86a] to-[#b89255]
                shadow-lg hover:shadow-xl transition"
              >
                Reset Password
              </button>

              <div className="text-center mt-4">
                <button
                  disabled={resendCooldown > 0 || resending}
                  onClick={resendOtp}
                  className="text-sm text-gray-600 hover:text-[#b89255] disabled:opacity-40"
                >
                  {resending
                    ? "Resending..."
                    : resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
