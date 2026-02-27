"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutButton({
  variant = "compact",
}: {
  variant?: "compact" | "stack";
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      await supabase.auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={
        variant === "stack"
          ? "group relative flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.06] bg-gradient-to-br from-[#222] to-[#1a1a1a] transition-all duration-200 hover:border-[#444] hover:translate-x-1 w-full text-left disabled:opacity-60"
          : "px-3.5 py-2 rounded-md bg-[#252525] border border-[#333] text-gray-500 text-[13px] hover:text-white hover:border-[#444] disabled:opacity-60 transition-all"
      }
    >
      {variant === "stack" ? (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#4a4a4a] to-[#333] group-hover:from-[#666] group-hover:to-[#4a4a4a] group-hover:w-1 transition-all" />
          <div className="w-9 h-9 flex items-center justify-center text-2xl">⇥</div>
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold text-white mb-0.5">{busy ? "Signing Out..." : "Logout"}</h2>
            <p className="text-xs text-gray-500">End session and return to login</p>
          </div>
          <span className="text-lg text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all">›</span>
        </>
      ) : busy ? (
        "..."
      ) : (
        "Logout"
      )}
    </button>
  );
}
