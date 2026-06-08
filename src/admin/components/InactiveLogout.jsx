import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const DEFAULT_TIMEOUT = 30 * 60 * 1000; // 30 minutes inactivity
const WARNING_BEFORE = 60 * 1000; // warn 60s before logout

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export default function useInactivityLogout(timeoutMs = DEFAULT_TIMEOUT) {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const warnRef = useRef(null);
  const warningToastId = useRef(null);

  useEffect(() => {
    // ── only run when an admin token exists ──
    const token = localStorage.getItem("token");
    if (!token) return;

    const logout = () => {
      // dismiss warning toast if visible
      if (warningToastId.current) {
        toast.dismiss(warningToastId.current);
        warningToastId.current = null;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("admin");

      toast.error("Session expired due to inactivity.", {
        duration: 4000,
        style: {
          background: "rgba(255,255,255,0.92)",
          border: "1px solid #e7dcc7",
          borderRadius: "14px",
        },
      });

      navigate("/admin/login", { replace: true });
    };

    const showWarning = () => {
      warningToastId.current = toast(
        "⏱ You'll be logged out in 60 seconds due to inactivity. Move your mouse or press any key to stay.",
        {
          duration: WARNING_BEFORE,
          style: {
            background: "#fff8ee",
            border: "1px solid #e7dcc7",
            borderRadius: "14px",
            fontSize: "13px",
            maxWidth: "360px",
          },
        },
      );
    };

    const resetTimer = () => {
      // clear any existing timers
      clearTimeout(timerRef.current);
      clearTimeout(warnRef.current);

      // dismiss warning if it was showing (user became active again)
      if (warningToastId.current) {
        toast.dismiss(warningToastId.current);
        warningToastId.current = null;
      }

      // set warning timer (fires 60s before actual logout)
      warnRef.current = setTimeout(showWarning, timeoutMs - WARNING_BEFORE);

      // set logout timer
      timerRef.current = setTimeout(logout, timeoutMs);
    };

    // attach activity listeners
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true }),
    );

    // start the initial timer
    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(warnRef.current);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, resetTimer),
      );
    };
  }, [navigate, timeoutMs]);
}
