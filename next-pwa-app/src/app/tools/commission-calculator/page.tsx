"use client";

import { useState } from "react";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

export default function CommissionCalculatorPage() {
  const [salePrice, setSalePrice] = useState("");
  const [commissionRate, setCommissionRate] = useState("10");
  const [apCount, setApCount] = useState("1");

  const price = parseFloat(salePrice) || 0;
  const rate = parseFloat(commissionRate) || 0;
  const aps = parseInt(apCount) || 1;

  const totalCommission = price * (rate / 100);
  const perAp = totalCommission / aps;

  return (
    <>
      <Navbar title="Commission Calculator" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[500px] mx-auto px-5 pt-20 pb-10">
        <PageHeader title="Commission Calculator" subtitle="Calculate your earnings" />

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Sale Price ($)
            </label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Enter sale amount"
              className="w-full px-4 py-3 rounded-xl bg-[#1f1f1f] border border-white/[0.1] text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Commission Rate (%)
            </label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              placeholder="10"
              className="w-full px-4 py-3 rounded-xl bg-[#1f1f1f] border border-white/[0.1] text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Number of Appointments
            </label>
            <input
              type="number"
              value={apCount}
              onChange={(e) => setApCount(e.target.value)}
              placeholder="1"
              min="1"
              className="w-full px-4 py-3 rounded-xl bg-[#1f1f1f] border border-white/[0.1] text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-8 p-6 rounded-xl border border-white/[0.06] bg-white/[0.04] space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total Commission</span>
            <span className="text-2xl font-bold text-green-400">
              ${totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-t border-white/[0.06] pt-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">Per Appointment</span>
            <span className="text-lg font-semibold text-white">
              ${perAp.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {aps > 1 && (
            <p className="text-xs text-gray-600 text-center">
              Based on {aps} appointment{aps > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <PageFooter />
      </div>
    </>
  );
}
