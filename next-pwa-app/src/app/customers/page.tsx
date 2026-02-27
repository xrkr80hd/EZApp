import Image from "next/image";
import { BackLink, PageFooter } from "@/components/ui";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";

export default function CustomersPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-5 py-10">
      <main className="w-full max-w-[500px]">
        <BackLink href="/" label="Back to Portal" />

        {/* Header */}
        <header className="flex items-center gap-4 px-5 py-4 mb-3 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.03]">
          <Image
            src="/icon-192x192.png"
            alt="EZBaths"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-lg font-semibold text-white">Customer Files</h1>
            <p className="text-xs text-gray-500 mt-0.5">Create new or load existing</p>
          </div>
        </header>

        {/* Options */}
        <nav className="flex flex-col gap-2">
          <Link
            href="/customers/new"
            className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.06] bg-gradient-to-br from-[#222] to-[#1a1a1a] transition-all duration-200 hover:border-[#444] hover:translate-x-1 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#4a4a4a] to-[#333] group-hover:from-[#666] group-hover:to-[#4a4a4a] group-hover:w-1 transition-all" />
            <div className="w-9 h-9 flex items-center justify-center text-2xl">+</div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-white mb-0.5">Create New Customer</h2>
              <p className="text-xs text-gray-500">Start a fresh customer file</p>
            </div>
            <span className="text-lg text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all">›</span>
          </Link>

          <Link
            href="/customers/load"
            className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.06] bg-gradient-to-br from-[#222] to-[#1a1a1a] transition-all duration-200 hover:border-[#444] hover:translate-x-1 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#4a4a4a] to-[#333] group-hover:from-[#666] group-hover:to-[#4a4a4a] group-hover:w-1 transition-all" />
            <div className="w-9 h-9 flex items-center justify-center text-2xl">📂</div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-white mb-0.5">Load Customer</h2>
              <p className="text-xs text-gray-500">Open saved EZAPP file or import JSON</p>
            </div>
            <span className="text-lg text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all">›</span>
          </Link>

          <LogoutButton variant="stack" />
        </nav>

        <PageFooter />
      </main>
    </div>
  );
}
