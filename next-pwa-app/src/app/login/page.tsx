"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const nextPath =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/"
      : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (mode === "login") {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        router.replace(nextPath);
        router.refresh();
      } else {
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signupError) throw signupError;
        setMessage("Account created. If email confirmation is enabled, verify first, then sign in.");
        setMode("login");
      }
    } catch (err) {
      setError((err as Error).message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#141414]">
      <form onSubmit={submit} className="w-full max-w-[420px] rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-4">
        <h1 className="text-xl font-semibold text-white">EZApp Login</h1>
        <p className="text-sm text-gray-400">Private access only.</p>

        <label className="block">
          <span className="block text-xs text-gray-300 mb-1">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-white/[0.12] bg-black/20 px-3 py-2 text-sm text-gray-100"
          />
        </label>

        <label className="block">
          <span className="block text-xs text-gray-300 mb-1">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-white/[0.12] bg-black/20 px-3 py-2 text-sm text-gray-100"
          />
        </label>

        {error && <p className="text-xs text-red-300">{error}</p>}
        {message && <p className="text-xs text-green-300">{message}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-60 py-2 text-sm font-semibold text-white"
        >
          {busy ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <button
          type="button"
          onClick={() => setMode((prev) => (prev === "login" ? "signup" : "login"))}
          className="w-full rounded-md border border-white/[0.15] py-2 text-xs text-gray-300"
        >
          {mode === "login" ? "Need an account? Create one" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
