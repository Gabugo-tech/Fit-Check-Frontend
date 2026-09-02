import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mail,
  Phone,
  Lock,
  User,
  ShieldCheck,
  Send,
  CheckCircle,
  Timer,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { authApi, otpApi } from "../lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string, phone: string, name: string, token?: string) => void;
  hideCloseButton?: boolean;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, hideCloseButton = false }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // OTP / verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [userEnteredCode, setUserEnteredCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setIsVerifying(false);
      setVerificationSuccess(false);
      setUserEnteredCode("");
      setVerificationError("");
      setToast(null);
      setCountdown(60);
      setFieldErrors({});
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    }
  }, [isOpen]);

  // Auto-focus
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      if (isVerifying && codeInputRef.current) {
        codeInputRef.current.focus();
      } else if (authMode === "register" && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (authMode === "login" && emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }, 150);
  }, [isOpen, authMode, isVerifying]);

  // Countdown timer
  useEffect(() => {
    if (!isVerifying || verificationSuccess || countdown <= 0) return;
    const t = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [isVerifying, verificationSuccess, countdown]);

  if (!isOpen) return null;

  const showToast = (message: string, type: "success" | "error" | "info" = "info", duration = 6000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Required", color: "bg-stone-200" };
    let pts = 0;
    if (pass.length >= 6) pts++;
    if (pass.length >= 10) pts++;
    if (/[0-9]/.test(pass)) pts++;
    if (/[A-Z]/.test(pass)) pts++;
    if (/[^A-Za-z0-9]/.test(pass)) pts++;
    if (pts <= 2) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (pts <= 4) return { score: 2, label: "Moderate", color: "bg-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500" };
  };

  const validateFields = () => {
    const errors: { [key: string]: string } = {};
    if (authMode === "register" && !name.trim()) {
      errors.name = "Full name is required.";
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = "A valid email address is required.";
    }
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Send OTP to email
  const sendOtp = async () => {
    setOtpSending(true);
    setVerificationError("");
    setUserEnteredCode("");
    try {
      await otpApi.send(email.trim());
      setIsVerifying(true);
      setCountdown(60);
      showToast(`Verification code sent to ${email.trim()}. Check your inbox.`, "success");
    } catch (err: any) {
      setFieldErrors({ email: err.message || "Failed to send verification code. Please try again." });
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");
    if (!validateFields()) return;

    if (authMode === "register") {
      await sendOtp();
    } else {
      setIsProcessingAuth(true);
      try {
        const result = await authApi.login({ email: email.trim(), password });
        onAuthSuccess(result.user.email, result.user.phone || "", result.user.name, result.token);
        onClose();
      } catch (err: any) {
        setFieldErrors({ email: err.message || "Login failed. Please try again." });
      } finally {
        setIsProcessingAuth(false);
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");

    if (!userEnteredCode || userEnteredCode.trim().length !== 6) {
      setVerificationError("Please enter the 6-digit code from your email.");
      return;
    }

    setIsProcessingAuth(true);
    try {
      await otpApi.verify(email.trim(), userEnteredCode.trim());
      setVerificationSuccess(true);
      showToast("Email verified! Creating your account...", "success");

      const result = await authApi.register({ name, email: email.trim(), phone, password });
      setTimeout(() => {
        onAuthSuccess(result.user.email, result.user.phone || phone, result.user.name, result.token);
        onClose();
      }, 800);
    } catch (err: any) {
      setVerificationSuccess(false);
      setVerificationError(err.message || "Incorrect code. Please try again.");
      setIsProcessingAuth(false);
    }
  };

  const handleResend = async () => {
    setCountdown(60);
    await sendOtp();
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={hideCloseButton ? undefined : onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-100 p-7">

          {/* Close button */}
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-900 p-1.5 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 px-4 py-3 rounded-lg text-xs font-medium flex items-start gap-2 ${
                  toast.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : toast.type === "error"
                    ? "bg-rose-50 border border-rose-200 text-rose-700"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isVerifying ? (
              /* ── Registration / Login Form ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                {/* Header */}
                <div className="text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#F68B1E] bg-orange-50 px-2.5 py-1 rounded-full">
                    Secure Customer Hub
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 uppercase tracking-tight">
                    {authMode === "register" ? "Create Account" : "Sign In"}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {authMode === "register"
                      ? "Place bids, track orders and save your wishlist."
                      : "Welcome back to FitCheck."}
                  </p>
                </div>

                {/* Tab switcher */}
                <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-lg text-xs font-mono font-bold">
                  {(["register", "login"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setAuthMode(mode); setFieldErrors({}); }}
                      className={`py-1.5 rounded transition-all uppercase ${
                        authMode === mode ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                      }`}
                    >
                      {mode === "register" ? "Register" : "Sign In"}
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-stone-200" />
                  <span className="mx-3 text-[9px] font-mono text-stone-400 uppercase">or</span>
                  <div className="flex-grow border-t border-stone-200" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Name */}
                  {authMode === "register" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">Full Name</label>
                      <div className="relative">
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={name}
                          onChange={e => { setName(e.target.value); if (fieldErrors.name) setFieldErrors(p => ({ ...p, name: "" })); }}
                          placeholder="e.g. Amara Okafor"
                          className={`w-full border-2 focus:border-[#F68B1E] p-2.5 pl-9 rounded-lg text-xs text-stone-900 outline-none transition-colors ${fieldErrors.name ? "border-rose-400" : "border-stone-200"}`}
                        />
                        <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
                      </div>
                      {fieldErrors.name && <p className="text-[9.5px] text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{fieldErrors.name}</p>}
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">Email Address</label>
                    <div className="relative">
                      <input
                        ref={emailInputRef}
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: "" })); }}
                        placeholder="you@example.com"
                        className={`w-full border-2 focus:border-[#F68B1E] p-2.5 pl-9 rounded-lg text-xs text-stone-900 outline-none transition-colors ${fieldErrors.email ? "border-rose-400" : "border-stone-200"}`}
                      />
                      <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
                    </div>
                    {fieldErrors.email && <p className="text-[9.5px] text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{fieldErrors.email}</p>}
                  </div>

                  {/* Phone (optional) */}
                  {authMode === "register" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                        Phone Number <span className="text-stone-400 font-normal normal-case">(optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+2348012345678"
                          className="w-full border-2 border-stone-200 focus:border-[#F68B1E] p-2.5 pl-9 rounded-lg text-xs text-stone-900 outline-none transition-colors"
                        />
                        <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
                      </div>
                      <p className="text-[8.5px] text-stone-400 font-mono">Used for order updates only — not required for verification.</p>
                    </div>
                  )}

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">Password</label>
                      {password && authMode === "register" && (
                        <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${strength.color} text-white`}>
                          {strength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: "" })); }}
                        placeholder="••••••••"
                        className={`w-full border-2 focus:border-[#F68B1E] p-2.5 pl-9 pr-9 rounded-lg text-xs text-stone-900 outline-none transition-colors ${fieldErrors.password ? "border-rose-400" : "border-stone-200"}`}
                      />
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-3 text-stone-400 hover:text-stone-700">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-[9.5px] text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{fieldErrors.password}</p>}
                    {authMode === "register" && password && (
                      <div className="grid grid-cols-3 gap-1 h-1 mt-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`h-full rounded-full transition-all ${strength.score >= i ? strength.color : "bg-stone-200"}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingAuth || otpSending}
                    className="w-full py-3 bg-[#F68B1E] hover:bg-[#D57B18] text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isProcessingAuth || otpSending ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {otpSending ? "Sending code..." : "Please wait..."}
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        {authMode === "register" ? "Register & Verify Email" : "Sign In"}
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-[11px] text-stone-500 pt-1">
                  {authMode === "register" ? "Already have an account? " : "Need an account? "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setFieldErrors({}); }}
                    className="text-[#F68B1E] font-bold hover:underline"
                  >
                    {authMode === "register" ? "Sign in" : "Register"}
                  </button>
                </p>
              </motion.div>
            ) : (
              /* ── Email OTP Verification Step ── */
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-orange-50 border-2 border-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6 text-[#F68B1E]" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">Check your email</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    We sent a 6-digit code to{" "}
                    <span className="font-bold text-stone-800">{email}</span>.
                    <br />Enter it below to verify your address.
                  </p>
                </div>

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  {/* Code input */}
                  <div className="space-y-2">
                    <input
                      ref={codeInputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={userEnteredCode}
                      onChange={e => {
                        setUserEnteredCode(e.target.value.replace(/\D/g, ""));
                        setVerificationError("");
                      }}
                      placeholder="000000"
                      className={`w-full border-2 focus:border-[#F68B1E] p-4 rounded-xl text-center font-mono text-3xl tracking-[0.5em] text-stone-900 outline-none transition-all ${
                        verificationError ? "border-rose-400 bg-rose-50" : verificationSuccess ? "border-emerald-400 bg-emerald-50" : "border-stone-200"
                      }`}
                    />
                    {verificationError && (
                      <p className="text-[10px] text-rose-600 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {verificationError}
                      </p>
                    )}
                    {verificationSuccess && (
                      <p className="text-[10px] text-emerald-600 flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified! Creating your account...
                      </p>
                    )}
                  </div>

                  {/* Countdown + resend */}
                  <div className="flex items-center justify-between text-xs text-stone-500 bg-stone-50 px-3 py-2 rounded-lg border border-stone-100">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Timer className="w-3.5 h-3.5 text-stone-400" />
                      Expires in <strong className="text-stone-700">{countdown}s</strong>
                    </span>
                    <button
                      type="button"
                      disabled={countdown > 0 || otpSending}
                      onClick={handleResend}
                      className={`flex items-center gap-1 font-bold text-[11px] transition-colors ${
                        countdown > 0 ? "text-stone-300 cursor-default" : "text-[#F68B1E] hover:underline cursor-pointer"
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Resend code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={verificationSuccess || isProcessingAuth || userEnteredCode.length !== 6}
                    className="w-full py-3 bg-[#1C1A17] hover:bg-stone-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingAuth ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Confirm & Create Account
                      </>
                    )}
                  </button>
                </form>

                {/* Back link */}
                <button
                  type="button"
                  onClick={() => { setIsVerifying(false); setVerificationError(""); setUserEnteredCode(""); }}
                  className="w-full text-center text-[11px] text-stone-400 hover:text-stone-700 transition-colors"
                >
                  ← Back to registration
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
