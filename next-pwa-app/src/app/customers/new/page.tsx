"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink, PageHeader, PageFooter } from "@/components/ui";
import {
  deleteCustomerFile,
  listCustomerFiles,
  setCurrentCustomer,
  type CustomerRegistryEntry,
  upsertCustomerFile,
} from "@/lib/customer-files";

export default function NewCustomerPage() {
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<CustomerRegistryEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    setCustomers(listCustomerFiles());
  }, []);

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
    setCustomers(listCustomerFiles());

    // Navigate to tools (customer portal)
    router.push("/tools");
  };

  const openCustomer = (id: string) => {
    setCurrentCustomer(id);
    router.push("/tools");
  };

  const removeCustomer = (id: string) => {
    const confirmed = window.confirm(
      `Delete customer "${id}" and all related local tool data?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;
    deleteCustomerFile(id);
    setCustomers(listCustomerFiles());
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

        <section className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
          <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Customer Database</h2>
          {customers.length === 0 ? (
            <p className="text-xs text-gray-500">No customer files yet.</p>
          ) : (
            <div className="space-y-2">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-lg border border-white/[0.08] bg-[#1f1f1f] px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openCustomer(customer.id)}
                      className="text-left flex-1"
                    >
                      <div className="text-sm font-semibold text-white">{customer.lastName}</div>
                      <div className="text-xs text-gray-500">
                        Updated: {new Date(customer.updatedAt).toLocaleString()}
                      </div>
                    </button>
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
          )}
        </section>

        <PageFooter />
      </main>
    </div>
  );
}
