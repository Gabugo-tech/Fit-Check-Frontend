import React, { useState } from "react";
import { X, Store, Loader2, CheckCircle, Send } from "lucide-react";
import { otpApi, sellersApi, tokenStore } from "../lib/api";

interface SellerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export default function SellerApplicationModal({
  isOpen, onClose, userEmail = "", userName = "",
}: SellerApplicationModalProps) {
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      setError("Name, email, and WhatsApp number are required.");
      return;
    }
    setLoading(true);
    try {
      await otpApi.send(email.trim().toLowerCase());
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otpCode.trim()) { setError("Please enter the verification code."); return; }
    setLoading(true);
    try {
      await otpApi.verify(email.trim().toLowerCase(), otpCode.trim());
      await sellersApi.applyAsSeller({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
      });
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Verification or submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setName(userName);
    setEmail(userEmail);
    setWhatsapp("");
    setBio("");
    setLocation("");
    setOtpCode("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#667eea]" />
            <h2 className="text-lg font-bold text-stone-900">Become a Seller</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === "success" ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-stone-900">Application Submitted!</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                The admin will review your application and contact you via WhatsApp. We'll get back to you within 24–48 hours.
              </p>
              <button
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          ) : step === "otp" ? (
            <form onSubmit={handleVerifyAndSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                A verification code was sent to <strong>{email}</strong>. Enter it below to confirm.
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Verification Code</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#667eea] transition-colors text-center tracking-widest font-mono text-lg"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setStep("form"); setError(""); }}
                  className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-sm font-semibold rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" />Verify & Submit</>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try { await otpApi.send(email); } catch {}
                }}
                className="w-full text-xs text-stone-500 hover:text-stone-700 transition-colors"
              >
                Resend code
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-sm text-stone-600 leading-relaxed">
                Tell us about yourself and your shop. We'll verify your email and review your application.
              </p>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#667eea] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#667eea] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">WhatsApp Number *</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#667eea] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#667eea] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">About your shop (optional)</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Describe what you sell and your story…"
                  rows={3}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#667eea] transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Sending code…</>
                ) : (
                  <><Send className="w-4 h-4" />Send Verification Code</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
