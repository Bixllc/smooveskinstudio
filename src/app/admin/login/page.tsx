"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "forgot";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://smooveskinstudio.com/api/auth/callback?next=/admin/reset-password",
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setMessage("Check your email for a password reset link.");
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f6f3]">
      <div className="w-full max-w-sm rounded-[16px] border border-black/[0.07] bg-white p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-6 text-center">
          <p className="text-[18px] font-semibold text-[#1b1814]">
            {mode === "login" ? "Admin Login" : "Reset Password"}
          </p>
          {mode === "forgot" && (
            <p className="mt-1 text-[13px] text-[#a8a39c]">
              Enter your email and we'll send you a reset link.
            </p>
          )}
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium text-[#7a756e] mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-[9px] border border-black/[0.12] px-3 py-[9px] text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[12px] font-medium text-[#7a756e]">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(null); }}
                  className="text-[12px] text-[#c9a96e] hover:opacity-75 transition-opacity"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-[9px] border border-black/[0.12] px-3 py-[9px] text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
              />
            </div>

            {error && <p className="text-[13px] text-[#b53a2e]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[9px] bg-[#1b1814] py-[10px] text-[13px] font-semibold text-white hover:opacity-85 transition-opacity disabled:opacity-60 border-none cursor-pointer"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-[12px] font-medium text-[#7a756e] mb-1.5">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-[9px] border border-black/[0.12] px-3 py-[9px] text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
              />
            </div>

            {error && <p className="text-[13px] text-[#b53a2e]">{error}</p>}
            {message && <p className="text-[13px] text-[#2e7d50]">{message}</p>}

            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full rounded-[9px] bg-[#1b1814] py-[10px] text-[13px] font-semibold text-white hover:opacity-85 transition-opacity disabled:opacity-60 border-none cursor-pointer"
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); setMessage(null); }}
              className="w-full text-[13px] text-[#7a756e] hover:text-[#1b1814] transition-colors"
            >
              ← Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
