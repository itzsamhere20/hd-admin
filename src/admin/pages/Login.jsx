import { Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const inputCls = `
  w-full h-[52px] px-4
  bg-[#faf8f5]
  border border-[#e7dcc7]
  rounded-2xl
  outline-none
  focus:border-[#b89255]
  transition
  text-gray-800
  font-cormorant text-base
  placeholder:text-gray-400
`;

const Login = () => {
  const [step, setStep] = useState("login"); // login | forgot | otp

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();

  // ── COOLDOWN ──
  const startCooldown = () => {
    setResendCooldown(60);
    const id = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── LOGIN ──
  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      toast.success("Logged in successfully");
      navigate("/admin", { replace: true });
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ── SEND OTP ──
  const sendOtp = async () => {
    try {
      setLoading(true);
      await api.post("/auth/send-reset-otp", { email });
      toast.success("OTP sent to email");
      startCooldown();
      setStep("otp");
    } catch {
      toast.error("Email not found");
    } finally {
      setLoading(false);
    }
  };

  // ── RESEND OTP ──
  const resendOtp = async () => {
    try {
      setResending(true);
      await api.post("/auth/send-reset-otp", { email });
      toast.success("OTP resent");
      startCooldown();
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  // ── RESET PASSWORD ──
  const resetPassword = async () => {
    try {
      setLoading(true);
      await api.put("/auth/reset-password", { email, otp, newPassword });
      toast.success("Password updated");
      setStep("login");
      setOtp("");
      setNewPassword("");
    } catch {
      toast.error("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const stepTitle = {
    login: "Sign In",
    forgot: "Forgot Password",
    otp: "Reset Password",
  };

  const stepSub = {
    login: "Secure Admin Access Portal",
    forgot: "We'll send a reset code to your email",
    otp: `Code sent to ${email}`,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4ef] relative overflow-hidden px-4">
      {/* background glows matching dashboard warm palette */}
      <div className="absolute w-[600px] h-[600px] bg-[#c9a86a]/15 blur-3xl rounded-full -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-[#b89255]/10 blur-3xl rounded-full -bottom-40 -right-20 pointer-events-none" />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.92)",
            border: "1px solid #e7dcc7",
            borderRadius: "14px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            fontFamily: "Cormorant, serif",
            fontSize: "15px",
          },
        }}
      />

      {/* CARD — same bg-white border-[#e7dcc7] rounded-3xl as dashboard cards */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
          {/* HEADER */}
          <div className="text-center mb-10">
            {/* icon badge */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center">
                <Shield size={24} className="text-[#b89255]" />
              </div>
            </div>
            <h1 className="font-luxury text-5xl text-primary tracking-wide uppercase">
              Hamdam
            </h1>{" "}
            <h1 className="font-luxury text-xs text-primary tracking-[0.3em]">
              jewellery
            </h1>
            <p className="font-cormorant text-lg text-gray-400 mt-2">
              {stepSub[step]}
            </p>
            {/* thin gold rule */}
            <div className="w-12 h-px bg-[#c9a86a] mx-auto mt-4 opacity-50" />
          </div>

          {/* step label */}
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#b89255]/70 font-medium mb-6 text-center">
            {stepTitle[step]}
          </p>

          {/* ── LOGIN ── */}
          {step === "login" && (
            <div className="space-y-4">
              <input
                className={inputCls}
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${inputCls} pr-12`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#b89255] transition"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              <button
                disabled={loading}
                onClick={handleLogin}
                className="w-full h-[52px] rounded-2xl bg-gray-900 text-white text-sm uppercase tracking-[0.25em] hover:bg-[#b89255] transition-all duration-300 disabled:opacity-60 mt-2"
              >
                {loading ? "Signing in..." : "Login to Dashboard"}
              </button>

              <button
                onClick={() => setStep("forgot")}
                className="w-full text-center text-sm font-cormorant text-gray-400 hover:text-[#b89255] transition mt-1"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* ── FORGOT ── */}
          {step === "forgot" && (
            <div className="space-y-4">
              <input
                className={inputCls}
                placeholder="Admin email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              />

              <button
                disabled={loading}
                onClick={sendOtp}
                className="w-full h-[52px] rounded-2xl bg-gray-900 text-white text-sm uppercase tracking-[0.25em] hover:bg-[#b89255] transition-all duration-300 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <button
                onClick={() => setStep("login")}
                className="w-full text-center text-sm font-cormorant text-gray-400 hover:text-[#b89255] transition"
              >
                ← Back to login
              </button>
            </div>
          )}

          {/* ── OTP / RESET ── */}
          {step === "otp" && (
            <div className="space-y-4">
              <input
                className={`${inputCls} text-center tracking-[0.5em]`}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <div className="relative">
                <input
                  type="password"
                  className={inputCls}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && resetPassword()}
                />
              </div>

              <button
                onClick={resetPassword}
                disabled={loading}
                className="w-full h-[52px] rounded-2xl bg-gray-900 text-white text-sm uppercase tracking-[0.25em] hover:bg-[#b89255] transition-all duration-300 disabled:opacity-60"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>

              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={() => setStep("login")}
                  className="text-sm font-cormorant text-gray-400 hover:text-[#b89255] transition"
                >
                  ← Back to login
                </button>
                <button
                  disabled={resendCooldown > 0 || resending}
                  onClick={resendOtp}
                  className={`text-sm font-cormorant transition ${
                    resendCooldown > 0 || resending
                      ? "text-gray-300"
                      : "text-[#b89255] hover:underline"
                  }`}
                >
                  {resending
                    ? "Resending..."
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* bottom note */}
        <p className="text-center text-xs text-gray-400 mt-6 tracking-[0.2em] uppercase font-cormorant">
          © {new Date().getFullYear()} Hamdam Jewellery
        </p>
      </div>
    </div>
  );
};

export default Login;
