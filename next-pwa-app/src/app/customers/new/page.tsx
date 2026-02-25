"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink, PageHeader, PageFooter } from "@/components/ui";
import { upsertCustomerFile } from "@/lib/customer-files";

export default function NewCustomerPage() {
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = lastName.trim();

    if (!trimmed) {
      setError("Please enter a last name");
      return;
    }

    if (trimmed.length < 2) {
      setError("Last name must be at least 2 characters");
      return;
    }

    upsertCustomerFile(trimmed);

    // Navigate to tools (customer portal)
    router.push("/tools");
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-5 py-10">
      <main className="w-full max-w-[500px]">
        <BackLink href="/customers" label="Back to Customer Files" />
        <PageHeader title="New Customer" subtitle="Enter customer last name to begin" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="lastName"
              className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2"
            >
              Customer Last Name
            </label>
            <input
              id="lastName"
              type="text"
              autoFocus
              autoComplete="off"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setError("");
              }}
              placeholder="Enter last name..."
              className="w-full px-4 py-3.5 rounded-xl bg-[#1f1f1f] border border-white/[0.1] text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors"
          >
            Create Customer File
          </button>
        </form>

        <PageFooter />
      </main>
    </div>
  );
}
