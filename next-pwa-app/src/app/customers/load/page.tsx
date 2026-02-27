"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink, PageHeader, PageFooter } from "@/components/ui";
import {
  deleteCustomerFile,
  importCustomerFile,
  listCustomerFiles,
  setCurrentCustomer,
  type CustomerRegistryEntry,
} from "@/lib/customer-files";

export default function LoadCustomerPage() {
  const [customers, setCustomers] = useState<CustomerRegistryEntry[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setCustomers(listCustomerFiles());
  }, []);

  const openCustomer = (id: string) => {
    setCurrentCustomer(id);
    setLoaded(id);
    setTimeout(() => router.push("/tools"), 500);
  };

  const removeCustomer = (id: string) => {
    const confirmed = window.confirm(
      `Delete customer "${id}" and related local tool data?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    const ok = deleteCustomerFile(id);
    if (!ok) {
      setError("Could not delete customer file.");
      return;
    }

    setCustomers(listCustomerFiles());
    setError("");
    if (loaded === id) setLoaded(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const imported = importCustomerFile(parsed);
        if (!imported) {
          setError("Invalid customer file — missing lastName field.");
          return;
        }

        const key = imported.lastName;
        setCustomers(listCustomerFiles());
        setLoaded(key);
        setError("");

        // Navigate after short delay
        setTimeout(() => router.push("/tools"), 800);
      } catch {
        setError("Could not parse file. Make sure it's valid JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-5 py-10">
      <main className="w-full max-w-[500px]">
        <BackLink href="/customers" label="Back to Customer Files" />
        <PageHeader title="Load Customer" subtitle="Open an EZAPP customer file or import JSON" />

        {customers.length > 0 && (
          <div className="mb-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Existing EZAPP Files</h2>
            <div className="space-y-2">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-[#1f1f1f]"
                >
                  <button
                    type="button"
                    onClick={() => openCustomer(customer.id)}
                    className="w-full text-left hover:text-brand-200 transition-colors"
                  >
                    <div className="text-sm font-semibold text-white">{customer.lastName}</div>
                    <div className="text-xs text-gray-500">
                      Updated: {new Date(customer.updatedAt).toLocaleString()}
                    </div>
                  </button>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeCustomer(customer.id)}
                      className="text-xs px-2 py-1 rounded border border-red-400/40 text-red-300 hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] hover:border-brand-500/30 hover:bg-white/[0.04] transition-all cursor-pointer"
        >
          <span className="text-4xl">📂</span>
          <p className="text-sm text-gray-400">Import a customer JSON file</p>
          <p className="text-xs text-gray-600">.json files only</p>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFile}
            className="hidden"
            aria-label="Select customer JSON file"
          />
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {loaded && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
            ✓ Loaded customer: <strong>{loaded}</strong> — redirecting...
          </div>
        )}

        <PageFooter />
      </main>
    </div>
  );
}
