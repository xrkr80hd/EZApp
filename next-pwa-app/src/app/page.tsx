"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";

const menuItems = [
  {
    href: "/customers",
    icon: "/icons/customer_survey.svg",
    title: "Create or Load Customer",
    description: "Start new or continue existing customer file",
    shortcut: "1",
  },
  {
    href: "/scheduler",
    icon: "/icons/ez_scheduler.svg",
    title: "Weekly Schedule",
    description: "Set your availability for the call center",
    shortcut: "2",
  },
  {
    href: "/tools",
    icon: "/icons/bathtub.svg",
    title: "Consultant Tools",
    description: "Calculators, references, and utilities",
    shortcut: "3",
  },
];

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const match = menuItems.find((m) => m.shortcut === e.key);
      if (match) router.push(match.href);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen px-5 py-10">
      <main className="w-full max-w-[500px]">
        {/* Header */}
        <header className="flex items-center gap-4 px-5 py-4 mb-3 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-sm">
          <Image
            src="/icon-192x192.png"
            alt="EZBaths"
            width={44}
            height={44}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              EZBaths Portal
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Consultant Tools &amp; Workflow
            </p>
          </div>
        </header>

        {/* Menu Cards */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.06] bg-gradient-to-br from-[#222] to-[#1a1a1a] transition-all duration-200 hover:border-brand-500/30 hover:bg-gradient-to-br hover:from-[#2a2a2a] hover:to-[#222] active:scale-[0.98]"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-brand-500/0 group-hover:bg-brand-500/[0.04] transition-colors duration-200" />

              {/* Shortcut badge */}
              <span className="absolute top-2 right-3 text-[10px] font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Press {item.shortcut}
              </span>

              {/* Icon */}
              <div className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-lg bg-white/[0.06]">
                <Image
                  src={item.icon}
                  alt=""
                  width={28}
                  height={28}
                  className="opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Content */}
              <div className="relative flex-1 min-w-0">
                <h2 className="text-[15px] font-medium text-white tracking-tight">
                  {item.title}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {item.description}
                </p>
              </div>

              {/* Arrow */}
              <span className="relative text-xl text-gray-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all duration-200">
                ›
              </span>
            </Link>
          ))}
          <LogoutButton variant="stack" />
        </nav>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} XRKR80HD Design
          </p>
          <p className="text-[10px] text-gray-700 mt-1">v2.0 — PWA</p>
        </footer>
      </main>
    </div>
  );
}
