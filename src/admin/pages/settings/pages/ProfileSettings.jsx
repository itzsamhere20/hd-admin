import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Mail,
  User,
  Shield,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import api from "../../../api/api";
import SettingsLayout from "../components/SettingsLayout";
import toast from "react-hot-toast";

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
const ProfileSettings = () => {
  const [admin, setAdmin] = useState(null);
  const [panel, setPanel] = useState(null); // "name" | "email" | "password"

  // name
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  // email flow  — steps: "currentOtp" → "newEmail" → "newOtp"
  const [emailStep, setEmailStep] = useState("currentOtp");
  const [currentOtp, setCurrentOtp] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // true only after admin clicks Send Code

  // password
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  // field-level errors
  const [fieldErrors, setFieldErrors] = useState({});

  /* ── FETCH ADMIN ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/auth/me");
        setAdmin(res.data);
      } catch {
        toast.error("Failed to load profile");
      }
    })();
  }, []);

  /* ── RESEND TIMER ── */
  useEffect(() => {
    if (!otpSent) return; // don't start timer until admin explicitly sends OTP
    if ((emailStep === "currentOtp" || emailStep === "newOtp") && !canResend) {
      const interval = setInterval(() => {
        setResendTimer((p) => {
          if (p <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [emailStep, canResend, otpSent]);

  const clearErrors = () => setFieldErrors({});
  const setError = (field, msg) =>
    setFieldErrors((p) => ({ ...p, [field]: msg }));

  const openPanel = (type) => {
    setPanel(type);
    clearErrors();
    if (type === "name") setNameInput(admin?.name || "");
    if (type === "email") {
      setEmailStep("currentOtp");
      setCurrentOtp("");
      setEmailInput("");
      setNewOtp("");
      setCanResend(false);
      setResendTimer(30);
      setOtpSent(false); // reset — show "Send Code" button, not OTP input
    }
    if (type === "password") {
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    }
  };

  const closePanel = () => {
    setPanel(null);
    clearErrors();
  };

  /* ════════════════════════════════════
     NAME
  ════════════════════════════════════ */
  const handleSaveName = async () => {
    if (!nameInput.trim()) return setError("name", "Please enter a valid name");
    setSavingName(true);
    try {
      const res = await api.put("/auth/change-name", {
        name: nameInput.trim(),
      });
      setAdmin(res.data.admin);

      window.dispatchEvent(
        new CustomEvent("admin-updated", {
          detail: res.data.admin,
        }),
      );
      closePanel();
      toast.success("Name updated successfully");
    } catch {
      setError("name", "Could not update name. Please try again.");
    } finally {
      setSavingName(false);
    }
  };

  /* ════════════════════════════════════
     EMAIL — step 1: send OTP to current email
  ════════════════════════════════════ */
  const sendCurrentEmailOtp = async () => {
    setSendingOtp(true);
    try {
      await api.post("/auth/send-current-email-otp");
      setOtpSent(true); // now show OTP input and start timer
      setCanResend(false);
      setResendTimer(30);
    } catch {
      setError("currentOtp", "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  /* EMAIL — step 1: verify OTP from current email */
  const verifyCurrentOtp = async () => {
    if (!currentOtp.trim() || currentOtp.length !== 6)
      return setError("currentOtp", "Please enter the 6-digit OTP");
    setVerifyingOtp(true);
    try {
      await api.post("/auth/verify-current-email-otp", {
        otp: currentOtp.trim(),
      });
      setEmailStep("newEmail");
      clearErrors();
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg.toLowerCase().includes("expired"))
        setError("currentOtp", "OTP has expired. Please request a new one.");
      else if (msg.toLowerCase().includes("invalid"))
        setError("currentOtp", "Incorrect OTP. Please check and try again.");
      else setError("currentOtp", "Verification failed. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  /* EMAIL — step 2: send OTP to new email */
  const sendNewEmailOtp = async () => {
    const email = emailInput.trim();
    if (!email) return setError("newEmail", "Please enter an email address");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("newEmail", "Please enter a valid email address");
    if (email === admin?.email)
      return setError(
        "newEmail",
        "This is already your current email. Please use a different one.",
      );
    setSendingOtp(true);
    try {
      await api.post("/auth/send-email-otp", { newEmail: email });
      setEmailStep("newOtp");
      setNewOtp("");
      setCanResend(false);
      setResendTimer(30);
      clearErrors();
      toast.success(`OTP sent to ${email}`);
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      // pass the backend message directly — it's already human-readable
      setError(
        "newEmail",
        msg || "Could not send OTP. Please check the email and try again.",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  /* EMAIL — step 3: verify new email OTP */
  const verifyNewEmailOtp = async () => {
    if (!newOtp.trim() || newOtp.length !== 6)
      return setError("newOtp", "Please enter the 6-digit OTP");
    setVerifyingOtp(true);
    try {
      await api.put("/auth/verify-email-otp", { otp: newOtp.trim() });
      setAdmin((p) => ({ ...p, email: emailInput.trim() }));
      window.dispatchEvent(
        new CustomEvent("admin-updated", {
          detail: { ...admin, email: emailInput.trim() },
        }),
      );
      closePanel();
      toast.success("Email updated successfully");
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg.toLowerCase().includes("expired"))
        setError("newOtp", "OTP has expired. Please request a new one.");
      else setError("newOtp", "Incorrect OTP. Please check and try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  /* ════════════════════════════════════
     PASSWORD
  ════════════════════════════════════ */
  const handleSavePassword = async () => {
    clearErrors();
    if (!oldPass)
      return setError("oldPass", "Please enter your current password");
    if (!newPass || newPass.length < 6)
      return setError("newPass", "Password must be at least 6 characters");
    if (newPass !== confirmPass)
      return setError("confirmPass", "Passwords don't match");
    if (newPass === oldPass)
      return setError(
        "newPass",
        "New password must be different from your current one",
      );
    setSavingPass(true);
    try {
      await api.put("/auth/change-password", {
        oldPassword: oldPass,
        newPassword: newPass,
      });
      closePanel();
      toast.success("Password updated successfully");
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (
        msg.toLowerCase().includes("incorrect") ||
        msg.toLowerCase().includes("wrong") ||
        msg.toLowerCase().includes("old")
      ) {
        setError("oldPass", "Current password is incorrect");
      } else {
        setError("oldPass", "Could not update password. Please try again.");
      }
    } finally {
      setSavingPass(false);
    }
  };

  if (!admin) {
    return (
      <SettingsLayout
        title="Profile Settings"
        description="Manage your account securely"
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Profile Settings"
      description="Manage your account securely"
    >
      {/* ── AVATAR ── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#f0ebe2] border border-[#e7dcc7] flex items-center justify-center font-luxury text-2xl text-gray-600 uppercase">
          {admin.name?.[0] || "A"}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-lg">{admin.name}</p>
          <p className="text-sm text-gray-400">{admin.email}</p>
        </div>
      </div>

      {/* ── PROFILE CARDS ── */}
      <div className="space-y-3 w-full">
        {/* NAME CARD */}
        <ProfileCard
          icon={<User size={16} />}
          label="Display Name"
          value={admin.name}
          onEdit={() => openPanel("name")}
        />

        {/* EMAIL CARD */}
        <ProfileCard
          icon={<Mail size={16} />}
          label="Email Address"
          value={admin.email}
          onEdit={() => openPanel("email")}
        />

        {/* PASSWORD CARD */}
        <ProfileCard
          icon={<Lock size={16} />}
          label="Password"
          value="••••••••"
          onEdit={() => openPanel("password")}
        />
      </div>

      {/* ════════════════════════════════════
          SIDE PANEL
      ════════════════════════════════════ */}
      <AnimatePresence>
        {panel && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={closePanel}
            />

            {/* DRAWER */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 30,
              }}
              className="fixed right-0 top-0 h-full w-3/4 sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
            >
              {/* DRAWER HEADER */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0ebe2] shrink-0">
                <div>
                  <h2 className="font-luxury text-2xl text-gray-800">
                    {panel === "name"
                      ? "Edit Name"
                      : panel === "email"
                        ? "Change Email"
                        : "Change Password"}
                  </h2>
                  <p className="font-cormorant text-lg text-gray-500 mt-0.5">
                    {panel === "name" && "Update your display name"}
                    {panel === "email" && "Verify both emails to update"}
                    {panel === "password" && "Keep your account secure"}
                  </p>
                </div>
                <button
                  onClick={closePanel}
                  className="w-9 h-9 rounded-2xl border border-[#e7dcc7] flex items-center justify-center hover:bg-[#faf7f2] transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* DRAWER BODY */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* ── NAME PANEL ── */}
                {panel === "name" && (
                  <div className="space-y-4">
                    <FormField label="New Name" error={fieldErrors.name}>
                      <input
                        autoFocus
                        type="text"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          clearErrors();
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                        placeholder="e.g. Hamdam Admin"
                        className={INPUT}
                      />
                    </FormField>
                  </div>
                )}

                {/* ── EMAIL PANEL ── */}
                {panel === "email" && (
                  <div className="space-y-5">
                    {/* STEP INDICATOR */}
                    <StepIndicator
                      steps={[
                        "Verify current email",
                        "Enter new email",
                        "Verify new email",
                      ]}
                      current={
                        emailStep === "currentOtp"
                          ? 0
                          : emailStep === "newEmail"
                            ? 1
                            : 2
                      }
                    />

                    {/* STEP 1 — OTP to current email */}
                    {emailStep === "currentOtp" && (
                      <div className="space-y-4">
                        <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl px-4 py-3">
                          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                            {otpSent
                              ? "OTP sent to"
                              : "Verification will be sent to"}
                          </p>
                          <p className="text-sm font-medium text-gray-800">
                            {admin.email}
                          </p>
                        </div>

                        {/* before send: just show any error */}
                        {!otpSent && fieldErrors.currentOtp && (
                          <p className="text-red-500 text-xs flex items-start gap-1">
                            <span className="mt-0.5 shrink-0">⚠</span>{" "}
                            {fieldErrors.currentOtp}
                          </p>
                        )}

                        {/* after send: show OTP input + resend */}
                        {otpSent && (
                          <>
                            <FormField
                              label="6-digit OTP"
                              error={fieldErrors.currentOtp}
                            >
                              <OtpInput
                                value={currentOtp}
                                onChange={(v) => {
                                  setCurrentOtp(v);
                                  clearErrors();
                                }}
                              />
                            </FormField>
                            <ResendRow
                              canResend={canResend}
                              timer={resendTimer}
                              loading={sendingOtp}
                              onResend={sendCurrentEmailOtp}
                            />
                          </>
                        )}
                      </div>
                    )}

                    {/* STEP 2 — new email input */}
                    {emailStep === "newEmail" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                          <Check
                            size={14}
                            className="text-emerald-600 shrink-0"
                          />
                          <p className="text-sm text-emerald-700">
                            Current email verified
                          </p>
                        </div>
                        <FormField
                          label="New Email Address"
                          error={fieldErrors.newEmail}
                        >
                          <input
                            autoFocus
                            type="email"
                            value={emailInput}
                            onChange={(e) => {
                              setEmailInput(e.target.value);
                              clearErrors();
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && sendNewEmailOtp()
                            }
                            placeholder="new@email.com"
                            className={INPUT}
                          />
                        </FormField>
                      </div>
                    )}

                    {/* STEP 3 — OTP to new email */}
                    {emailStep === "newOtp" && (
                      <div className="space-y-4">
                        <div className="bg-[#faf7f2] border border-[#e7dcc7] rounded-2xl px-4 py-3">
                          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                            OTP sent to
                          </p>
                          <p className="text-sm font-medium text-gray-800">
                            {emailInput}
                          </p>
                          <button
                            onClick={() => {
                              setEmailStep("newEmail");
                              clearErrors();
                            }}
                            className="text-xs text-primary mt-1 hover:underline"
                          >
                            Change email
                          </button>
                        </div>
                        <FormField
                          label="6-digit OTP"
                          error={fieldErrors.newOtp}
                        >
                          <OtpInput
                            value={newOtp}
                            onChange={(v) => {
                              setNewOtp(v);
                              clearErrors();
                            }}
                          />
                        </FormField>
                        <ResendRow
                          canResend={canResend}
                          timer={resendTimer}
                          loading={sendingOtp}
                          onResend={() => sendNewEmailOtp()}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ── PASSWORD PANEL ── */}
                {panel === "password" && (
                  <div className="space-y-4">
                    <FormField
                      label="Current Password"
                      error={fieldErrors.oldPass}
                    >
                      <PasswordInput
                        value={oldPass}
                        onChange={(v) => {
                          setOldPass(v);
                          clearErrors();
                        }}
                        show={showOld}
                        onToggle={() => setShowOld((p) => !p)}
                        placeholder="Enter current password"
                      />
                    </FormField>
                    <FormField label="New Password" error={fieldErrors.newPass}>
                      <PasswordInput
                        value={newPass}
                        onChange={(v) => {
                          setNewPass(v);
                          clearErrors();
                        }}
                        show={showNew}
                        onToggle={() => setShowNew((p) => !p)}
                        placeholder="Minimum 6 characters"
                      />
                    </FormField>
                    <FormField
                      label="Confirm New Password"
                      error={fieldErrors.confirmPass}
                    >
                      <PasswordInput
                        value={confirmPass}
                        onChange={(v) => {
                          setConfirmPass(v);
                          clearErrors();
                        }}
                        show={showNew}
                        onToggle={() => setShowNew((p) => !p)}
                        placeholder="Repeat new password"
                      />
                    </FormField>
                  </div>
                )}
              </div>

              {/* DRAWER FOOTER */}
              <div className="px-6 py-4 border-t border-[#f0ebe2] shrink-0">
                {/* NAME FOOTER */}
                {panel === "name" && (
                  <div className="flex gap-3">
                    <button
                      disabled={savingName}
                      onClick={closePanel}
                      className={BTN_CANCEL}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={savingName}
                      onClick={handleSaveName}
                      className={BTN_PRIMARY}
                    >
                      {savingName ? "Saving..." : "Save Name"}
                    </button>
                  </div>
                )}

                {/* EMAIL FOOTER */}
                {panel === "email" && (
                  <div className="flex gap-3">
                    <button onClick={closePanel} className={BTN_CANCEL}>
                      Cancel
                    </button>
                    {emailStep === "currentOtp" &&
                      (!otpSent ? (
                        <button
                          disabled={sendingOtp}
                          onClick={sendCurrentEmailOtp}
                          className={BTN_PRIMARY}
                        >
                          {sendingOtp ? "Sending..." : "Send Code"}
                        </button>
                      ) : (
                        <button
                          disabled={verifyingOtp || !currentOtp}
                          onClick={verifyCurrentOtp}
                          className={BTN_PRIMARY}
                        >
                          {verifyingOtp ? "Verifying..." : "Verify OTP"}
                        </button>
                      ))}
                    {emailStep === "newEmail" && (
                      <button
                        disabled={sendingOtp || !emailInput.trim()}
                        onClick={sendNewEmailOtp}
                        className={BTN_PRIMARY}
                      >
                        {sendingOtp ? "Sending..." : "Send OTP"}
                      </button>
                    )}
                    {emailStep === "newOtp" && (
                      <button
                        disabled={verifyingOtp || !newOtp}
                        onClick={verifyNewEmailOtp}
                        className={BTN_PRIMARY}
                      >
                        {verifyingOtp ? "Verifying..." : "Confirm Email"}
                      </button>
                    )}
                  </div>
                )}

                {/* PASSWORD FOOTER */}
                {panel === "password" && (
                  <div className="flex gap-3">
                    <button
                      disabled={savingPass}
                      onClick={closePanel}
                      className={BTN_CANCEL}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={savingPass}
                      onClick={handleSavePassword}
                      className={BTN_PRIMARY}
                    >
                      {savingPass ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SettingsLayout>
  );
};

export default ProfileSettings;

/* ════════════════════════════════════
   SMALL COMPONENTS
════════════════════════════════════ */

function ProfileCard({ icon, label, value, onEdit }) {
  return (
    <div className="bg-white border border-[#e7dcc7] rounded-3xl p-5 flex items-center gap-4 hover:bg-[#faf7f2] transition-colors">
      <div className="w-10 h-10 rounded-2xl bg-[#f7f4ef] border border-[#e7dcc7] flex items-center justify-center text-gray-500 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="font-medium text-gray-800 text-sm mt-0.5 truncate">
          {value}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-[#e7dcc7] px-3 py-2 rounded-xl hover:bg-white transition-colors shrink-0"
      >
        Edit <ChevronRight size={12} />
      </button>
    </div>
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-0 mb-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-semibold transition-all
              ${
                i < current
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : i === current
                    ? "bg-primary/70 border-primary/60 text-white"
                    : "bg-white border-[#e7dcc7] text-gray-400"
              }`}
            >
              {i < current ? <Check size={10} /> : i + 1}
            </div>
            <p
              className={`text-[9px] mt-1 text-center w-16 leading-tight ${i === current ? "text-gray-700 font-medium" : "text-gray-400"}`}
            >
              {step}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-px flex-1 mb-4 mx-1 ${i < current ? "bg-emerald-400" : "bg-[#e7dcc7]"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function OtpInput({ value, onChange }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      placeholder="• • • • • •"
      className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2] text-lg tracking-[0.5em] text-center placeholder:text-gray-200 focus:border-gray-400 transition-colors"
    />
  );
}

function PasswordInput({ value, onChange, show, onToggle, placeholder }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 pr-12 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function ResendRow({ canResend, timer, loading, onResend }) {
  return (
    <div className="text-center text-sm">
      {canResend ? (
        <button
          onClick={onResend}
          disabled={loading}
          className="text-primary font-medium hover:underline disabled:opacity-50"
        >
          {loading ? "Sending..." : "Resend OTP"}
        </button>
      ) : (
        <p className="text-gray-400">
          Resend available in{" "}
          <span className="font-medium text-gray-600">{timer}s</span>
        </p>
      )}
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-start gap-1">
          <span className="mt-0.5 shrink-0">⚠</span> {error}
        </p>
      )}
    </div>
  );
}

/* ── SHARED STYLES ── */
const INPUT =
  "w-full h-[50px] border border-[#e7dcc7] rounded-2xl px-4 outline-none bg-[#faf7f2] text-sm placeholder:text-gray-300 focus:border-gray-400 transition-colors";
const BTN_PRIMARY =
  "flex-1 h-[50px] rounded-2xl bg-primary text-white hover:opacity-80 transition disabled:opacity-40 font-medium text-sm";
const BTN_CANCEL =
  "flex-1 h-[50px] rounded-2xl border border-[#e7dcc7] text-gray-700 hover:bg-[#faf7f2] transition disabled:opacity-50 text-sm";
