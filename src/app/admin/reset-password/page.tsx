"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const linkError = null;

  useEffect(() => {
    // Session is already established server-side by /api/auth/callback.
    // Just verify the user is authenticated before showing the form.
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Sign out to clear the recovery session before redirecting to login
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f6f3]">
      <div className="w-full max-w-sm rounded-[16px] border border-black/[0.07] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-[18px] font-semibold text-[#1b1814]">Set New Password</p>
          <p className="mt-1 text-[13px] text-[#a8a39c]">Choose a new password for your account.</p>
        </div>

        {linkError ? (
          <div className="space-y-4">
            <p className="text-center text-[13px] text-[#b53a2e]">{linkError}</p>
            <a href="/admin/login" className="block w-full text-center rounded-[9px] bg-[#1b1814] py-[10px] text-[13px] font-semibold text-white hover:opacity-85 transition-opacity">
              Back to Login
            </a>
          </div>
        ) : !ready ? (
          <p className="text-center text-[13px] text-[#a8a39c]">Verifying reset link…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-[12px] font-medium text-[#7a756e] mb-1.5">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-[9px] border border-black/[0.12] px-3 py-[9px] text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-[12px] font-medium text-[#7a756e] mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
