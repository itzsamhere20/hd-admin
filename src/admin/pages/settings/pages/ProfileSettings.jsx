import { useEffect, useState } from "react";
import {
  X,
  Mail,
  User,
  Shield,
  Check,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import api from "../../../api/api";
import SettingsLayout from "../components/SettingsLayout";
import toast from "react-hot-toast";

/* ── shared input style ── */
const INPUT =
  "w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors";

export default function ProfileSettings() {
  const [admin, setAdmin] = useState(null);
  const [panel, setPanel] = useState(null); // "name" | "email" | "password"

  /* name */
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  /* email flow steps: "current-otp" → "new-email" → "new-otp" */
  const [emailStep, setEmailStep] = useState("current-otp");
  const [currentOtp, setCurrentOtp] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  /* password */
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [showPw, setShowPw] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [savingPw, setSavingPw] = useState(false);

  /* ── FETCH ── */
  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => setAdmin(r.data))
      .catch(console.error);
  }, []);

  /* ── RESEND TIMER ── */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* ── OPEN PANEL ── */
  const openPanel = (type) => {
    setPanel(type);
    if (type === "name") setNameInput(admin?.name || "");
    if (type === "email") {
      setEmailStep("current-otp");
      setCurrentOtp("");
      setEmailInput("");
      setNewOtp("");
      setResendTimer(0);
    }
    if (type === "password") setPwForm({ old: "", new: "", confirm: "" });
  };

  const closePanel = () => setPanel(null);

  /* ═══════════════════════════════════
     NAME
  ═══════════════════════════════════ */
  const handleSaveName = async () => {
    if (!nameInput.trim()) return toast.error("Name cannot be empty");
    setSavingName(true);
    try {
      const res = await api.put("/auth/change-name", {
        name: nameInput.trim(),
      });
      setAdmin(res.data.admin);
      toast.success("Name updated");
      closePanel();
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  /* ═══════════════════════════════════
     EMAIL — step 1: send OTP to CURRENT email
  ═══════════════════════════════════ */
  const handleSendCurrentOtp = async () => {
    setSendingOtp(true);
    try {
      await api.post("/auth/send-current-email-otp");
      setEmailStep("verify-current");
      setResendTimer(30);
      toast.success(`OTP sent to ${admin.email}`);
    } catch {
      toast.error("Failed to send OTP. Try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  /* ── step 2: verify current email OTP ── */
  const handleVerifyCurrentOtp = async () => {
    if (!currentOtp.trim()) return toast.error("Enter the OTP");
    setVerifying(true);
    try {
      await api.post("/auth/verify-current-email-otp", {
        otp: currentOtp.trim(),
      });
      setEmailStep("new-email");
      setCurrentOtp("");
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg.toLowerCase().includes("otp"))
        toast.error("Incorrect OTP. Please try again.");
      else if (msg.toLowerCase().includes("expir"))
        toast.error("OTP has expired. Please resend.");
      else toast.error("Verification failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  /* ── step 3: enter new email → send OTP to it ── */
  const handleSendNewOtp = async () => {
    const email = emailInput.trim();
    if (!email) return toast.error("Please enter your new email address");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error("That doesn't look like a valid email");
    if (email === admin?.email)
      return toast.error("Please use a different email address");
    setSendingOtp(true);
    try {
      await api.post("/auth/send-email-otp", { newEmail: email });
      setEmailStep("new-otp");
      setResendTimer(30);
      toast.success(`OTP sent to ${email}`);
    } catch {
      toast.error("Failed to send OTP. Try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  /* ── step 4: verify new email OTP ── */
  const handleVerifyNewOtp = async () => {
    if (!newOtp.trim()) return toast.error("Enter the OTP");
    setVerifying(true);
    try {
      const res = await api.put("/auth/verify-email-otp", {
        otp: newOtp.trim(),
      });
      setAdmin((p) => ({ ...p, email: emailInput.trim() }));
      toast.success("Email updated successfully");
      closePanel();
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg.toLowerCase().includes("otp"))
        toast.error("Incorrect OTP. Please try again.");
      else if (msg.toLowerCase().includes("expir"))
        toast.error("OTP has expired. Please resend.");
      else toast.error("Verification failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  /* ── resend ── */
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setSendingOtp(true);
    try {
      if (emailStep === "verify-current") {
        await api.post("/auth/send-current-email-otp");
        toast.success(`OTP resent to ${admin.email}`);
      } else {
        await api.post("/auth/send-email-otp", { newEmail: emailInput.trim() });
        toast.success(`OTP resent to ${emailInput}`);
      }
      setResendTimer(30);
    } catch {
      toast.error("Failed to resend. Try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  /* ═══════════════════════════════════
     PASSWORD
  ═══════════════════════════════════ */
  const handleSavePassword = async () => {
    if (!pwForm.old) return toast.error("Enter your current password");
    if (!pwForm.new) return toast.error("Enter a new password");
    if (pwForm.new.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (pwForm.new !== pwForm.confirm)
      return toast.error("Passwords do not match");
    setSavingPw(true);
    try {
      await api.put("/auth/change-password", {
        oldPassword: pwForm.old,
        newPassword: pwForm.new,
      });
      toast.success("Password updated");
      closePanel();
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (
        msg.toLowerCase().includes("incorrect") ||
        msg.toLowerCase().includes("wrong") ||
        msg.toLowerCase().includes("invalid")
      )
        toast.error("Current password is incorrect");
      else toast.error("Failed to update password. Try again.");
    } finally {
      setSavingPw(false);
    }
  };

  if (!admin)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
      </div>
    );

  return (
    <SettingsLayout
      title="Profile Settings"
      description="Manage your admin account"
    >
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="font-luxury text-3xl text-gray-800">Profile Settings</h1>
        <p className="font-cormorant text-lg text-gray-500 mt-0.5">
          Update your name, email or password
        </p>
      </div>

      {/* CARDS */}
      <div className="space-y-4 max-w-lg">
        {/* NAME */}
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 flex items-center justify-between hover:bg-[#faf7f2] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#f0ebe2] border border-[#e7dcc7] flex items-center justify-center shrink-0">
              <User size={17} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Username
              </p>
              <p className="font-medium text-gray-800 mt-0.5">{admin.name}</p>
            </div>
          </div>
          <button
            onClick={() => openPanel("name")}
            className="text-xs text-primary font-medium uppercase tracking-widest hover:opacity-70 transition"
          >
            Edit
          </button>
        </div>

        {/* EMAIL */}
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 flex items-center justify-between hover:bg-[#faf7f2] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#f0ebe2] border border-[#e7dcc7] flex items-center justify-center shrink-0">
              <Mail size={17} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Email
              </p>
              <p className="font-medium text-gray-800 mt-0.5">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={() => openPanel("email")}
            className="text-xs text-primary font-medium uppercase tracking-widest hover:opacity-70 transition"
          >
            Edit
          </button>
        </div>

        {/* PASSWORD */}
        <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 flex items-center justify-between hover:bg-[#faf7f2] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#f0ebe2] border border-[#e7dcc7] flex items-center justify-center shrink-0">
              <Shield size={17} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Password
              </p>
              <p className="font-medium text-gray-800 mt-0.5">••••••••</p>
            </div>
          </div>
          <button
            onClick={() => openPanel("password")}
            className="text-xs text-primary font-medium uppercase tracking-widest hover:opacity-70 transition"
          >
            Edit
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT PANEL
      ════════════════════════════════════════ */}
      {panel && (
        <>
          {/* overlay */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closePanel}
          />

          <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col">
            {/* PANEL HEADER */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-[#f0ebe2] shrink-0">
              <button
                onClick={closePanel}
                className="w-9 h-9 rounded-2xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
              >
                <X size={16} />
              </button>
              <div>
                <h2 className="font-luxury text-2xl text-gray-800">
                  {panel === "name"
                    ? "Edit Name"
                    : panel === "email"
                      ? "Change Email"
                      : "Change Password"}
                </h2>
                <p className="font-cormorant text-base text-gray-400 mt-0.5">
                  {panel === "name"
                    ? "Update your display name"
                    : panel === "email"
                      ? "Verify identity then update email"
                      : "Enter current and new password"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* ── NAME ── */}
              {panel === "name" && (
                <div className="space-y-4">
                  <Field label="New Name">
                    <input
                      autoFocus
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      placeholder="Enter your name"
                      className={INPUT}
                    />
                  </Field>
                  <SaveBtn
                    onClick={handleSaveName}
                    loading={savingName}
                    label="Save Name"
                  />
                </div>
              )}

              {/* ── EMAIL ── */}
              {panel === "email" && (
                <div className="space-y-5">
                  {/* STEP INDICATOR */}
                  <div className="flex items-center gap-2 mb-2">
                    {["Verify Identity", "New Email", "Confirm"].map((s, i) => {
                      const stepIdx =
                        emailStep === "current-otp" ||
                        emailStep === "verify-current"
                          ? 0
                          : emailStep === "new-email"
                            ? 1
                            : 2;
                      const done = i < stepIdx;
                      const active = i === stepIdx;
                      return (
                        <div key={i} className="flex items-center gap-1.5">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-medium transition-all
                            ${
                              done
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : active
                                  ? "border-black bg-white text-black"
                                  : "border-[#e7dcc7] text-gray-300"
                            }`}
                          >
                            {done ? <Check size={11} /> : i + 1}
                          </div>
                          <span
                            className={`text-[10px] uppercase tracking-widest hidden sm:block ${active ? "text-gray-800 font-medium" : "text-gray-400"}`}
                          >
                            {s}
                          </span>
                          {i < 2 && <div className="w-6 h-px bg-[#e7dcc7]" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* STEP: send OTP to current email */}
                  {emailStep === "current-otp" && (
                    <div className="space-y-4">
                      <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                          Current Email
                        </p>
                        <p className="font-medium text-gray-800">
                          {admin.email}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        We'll send a 6-digit code to your current email to
                        confirm it's you.
                      </p>
                      <SaveBtn
                        onClick={handleSendCurrentOtp}
                        loading={sendingOtp}
                        label="Send Verification Code"
                      />
                    </div>
                  )}

                  {/* STEP: verify current OTP */}
                  {emailStep === "verify-current" && (
                    <div className="space-y-4">
                      <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl p-3 flex items-center gap-3">
                        <Mail size={15} className="text-gray-400 shrink-0" />
                        <p className="text-sm text-gray-600">
                          Code sent to{" "}
                          <span className="font-medium text-gray-800">
                            {admin.email}
                          </span>
                        </p>
                      </div>
                      <Field label="Enter 6-digit code">
                        <input
                          autoFocus
                          type="text"
                          maxLength={6}
                          value={currentOtp}
                          onChange={(e) =>
                            setCurrentOtp(e.target.value.replace(/\D/g, ""))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleVerifyCurrentOtp()
                          }
                          placeholder="000000"
                          className={
                            INPUT +
                            " text-center tracking-[0.5em] text-lg font-medium"
                          }
                        />
                      </Field>
                      <SaveBtn
                        onClick={handleVerifyCurrentOtp}
                        loading={verifying}
                        label="Verify Code"
                      />
                      <ResendRow
                        timer={resendTimer}
                        onResend={handleResend}
                        sending={sendingOtp}
                      />
                      <button
                        onClick={() => setEmailStep("current-otp")}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
                      >
                        <ArrowLeft size={12} /> Back
                      </button>
                    </div>
                  )}

                  {/* STEP: enter new email */}
                  {emailStep === "new-email" && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        Identity confirmed. Enter your new email address.
                      </p>
                      <Field label="New Email Address">
                        <input
                          autoFocus
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSendNewOtp()
                          }
                          placeholder="you@example.com"
                          className={INPUT}
                        />
                      </Field>
                      <SaveBtn
                        onClick={handleSendNewOtp}
                        loading={sendingOtp}
                        label="Send Code to New Email"
                      />
                    </div>
                  )}

                  {/* STEP: verify new OTP */}
                  {emailStep === "new-otp" && (
                    <div className="space-y-4">
                      <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl p-3 flex items-center gap-3">
                        <Mail size={15} className="text-gray-400 shrink-0" />
                        <p className="text-sm text-gray-600">
                          Code sent to{" "}
                          <span className="font-medium text-gray-800">
                            {emailInput}
                          </span>
                        </p>
                      </div>
                      <Field label="Enter 6-digit code">
                        <input
                          autoFocus
                          type="text"
                          maxLength={6}
                          value={newOtp}
                          onChange={(e) =>
                            setNewOtp(e.target.value.replace(/\D/g, ""))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleVerifyNewOtp()
                          }
                          placeholder="000000"
                          className={
                            INPUT +
                            " text-center tracking-[0.5em] text-lg font-medium"
                          }
                        />
                      </Field>
                      <SaveBtn
                        onClick={handleVerifyNewOtp}
                        loading={verifying}
                        label="Confirm New Email"
                      />
                      <ResendRow
                        timer={resendTimer}
                        onResend={handleResend}
                        sending={sendingOtp}
                      />
                      <button
                        onClick={() => setEmailStep("new-email")}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
                      >
                        <ArrowLeft size={12} /> Change email
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── PASSWORD ── */}
              {panel === "password" && (
                <div className="space-y-4">
                  {[
                    {
                      key: "old",
                      label: "Current Password",
                      placeholder: "Enter current password",
                    },
                    {
                      key: "new",
                      label: "New Password",
                      placeholder: "At least 6 characters",
                    },
                    {
                      key: "confirm",
                      label: "Confirm Password",
                      placeholder: "Repeat new password",
                    },
                  ].map(({ key, label, placeholder }) => (
                    <Field key={key} label={label}>
                      <div className="relative">
                        <input
                          type={showPw[key] ? "text" : "password"}
                          value={pwForm[key]}
                          onChange={(e) =>
                            setPwForm((p) => ({ ...p, [key]: e.target.value }))
                          }
                          placeholder={placeholder}
                          className={INPUT + " pr-12"}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPw((p) => ({ ...p, [key]: !p[key] }))
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPw[key] ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </Field>
                  ))}

                  {/* MATCH INDICATOR */}
                  {pwForm.new && pwForm.confirm && (
                    <div
                      className={`flex items-center gap-2 text-xs ${pwForm.new === pwForm.confirm ? "text-emerald-600" : "text-red-500"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${pwForm.new === pwForm.confirm ? "bg-emerald-500" : "bg-red-400"}`}
                      />
                      {pwForm.new === pwForm.confirm
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </div>
                  )}

                  <SaveBtn
                    onClick={handleSavePassword}
                    loading={savingPw}
                    label="Update Password"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </SettingsLayout>
  );
}

/* ── FIELD WRAPPER ── */
function Field({ label, children }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      {children}
    </div>
  );
}

/* ── SAVE BUTTON ── */
function SaveBtn({ onClick, loading, label }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full h-[50px] rounded-2xl bg-black text-white hover:opacity-80 transition disabled:opacity-40 font-medium flex items-center justify-center gap-2 text-sm"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <Check size={15} /> {label}
        </>
      )}
    </button>
  );
}

/* ── RESEND ROW ── */
function ResendRow({ timer, onResend, sending }) {
  return (
    <p className="text-center text-sm text-gray-400">
      {timer > 0 ? (
        <>
          Resend in <span className="font-medium text-gray-600">{timer}s</span>
        </>
      ) : (
        <button
          onClick={onResend}
          disabled={sending}
          className="text-primary font-medium hover:opacity-70 transition disabled:opacity-40"
        >
          Resend Code
        </button>
      )}
    </p>
  );
}
