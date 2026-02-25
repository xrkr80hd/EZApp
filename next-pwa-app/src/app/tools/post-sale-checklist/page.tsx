"use client";

import { useState, useEffect } from "react";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
}

const SECTIONS: { title: string; icon: string; items: { id: string; label: string }[] }[] = [
  {
    title: "Dropbox Uploads",
    icon: "📦",
    items: [
      { id: "dropboxPhotos", label: "Photos Uploaded to Dropbox" },
      { id: "dropboxVideo", label: "Video Uploaded to Dropbox" },
    ],
  },
  {
    title: "One Click Uploads",
    icon: "☁️",
    items: [
      { id: "oneClickJOC", label: "JOC Form Uploaded" },
      { id: "oneClickMeasurement", label: "Measurement Form Uploaded" },
      { id: "oneClickExpectations", label: "Customer Expectations Form Uploaded" },
      { id: "oneClickCommission", label: "Commission Calculator Uploaded" },
      { id: "oneClickOfficeProcess", label: "Office Process Checklist Uploaded" },
    ],
  },
  {
    title: "Post Sale Checklist",
    icon: "✅",
    items: [{ id: "postSaleComplete", label: "Post Sale Checklist Form Complete" }],
  },
];

const ALL_IDS = SECTIONS.flatMap((s) => s.items.map((i) => i.id));

export default function PostSaleChecklistPage() {
  const [customerName, setCustomerName] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_IDS.map((id) => [id, false]))
  );

  useEffect(() => {
    const name = localStorage.getItem("currentCustomer") || "";
    setCustomerName(name);
    const saved = localStorage.getItem(`postSaleChecklist_${name}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.jobNumber) setJobNumber(data.jobNumber);
        if (data.checks) setChecks((prev) => ({ ...prev, ...data.checks }));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const toggle = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completed = ALL_IDS.filter((id) => checks[id]).length;
  const total = ALL_IDS.length;
  const pct = Math.round((completed / total) * 100);

  const save = () => {
    const name = localStorage.getItem("currentCustomer") || "UNKNOWN";
    const data = { customerName, jobNumber, checks, completionPct: pct, date: new Date().toISOString() };
    localStorage.setItem(`postSaleChecklist_${name}`, JSON.stringify(data));
    alert("✅ Post Sale Checklist saved!");
  };

  return (
    <>
      <Navbar title="Post-Sale Checklist" actions={[{ label: "Documents", href: "/tools/post-sale-documents" }]} />
      <div className="max-w-[700px] mx-auto px-5 pt-20 pb-10">
        <PageHeader title="Post Sale Checklist" subtitle="Document Upload & Processing Verification" />

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="pscCustomerName" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Customer Name</label>
            <input
              id="pscCustomerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-brand-500/40"
            />
          </div>
          <div>
            <label htmlFor="pscJobNumber" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Job Number</label>
            <input
              id="pscJobNumber"
              type="text"
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value)}
              placeholder="Job #"
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-brand-500/40"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400 font-medium">Overall Completion</span>
            <span className="text-white font-semibold">{completed} / {total} ({pct}%)</span>
          </div>
          <div className="h-6 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-white"
              style={{ width: `${pct}%` }}
            >
              {pct > 15 ? `${pct}%` : ""}
            </div>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-5 rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="px-4 py-3 bg-white/[0.06] text-sm font-bold text-white">
              {section.icon} {section.title.toUpperCase()}
            </div>
            <div className="divide-y divide-white/[0.04]">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  role="checkbox"
                  aria-checked={checks[item.id] ? "true" : "false"}
                  tabIndex={0}
                  onClick={() => toggle(item.id)}
                  onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(item.id); } }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer transition-colors ${
                    checks[item.id] ? "bg-brand-600/10" : "bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  <span className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    checks[item.id] ? "bg-brand-500 border-brand-500 text-white" : "border-gray-600 bg-transparent"
                  }`}>
                    {checks[item.id] && <span className="text-xs font-bold">✓</span>}
                  </span>
                  <span className="flex-1 text-sm text-gray-300">{item.label}</span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase ${
                      checks[item.id] ? "bg-brand-600/20 text-brand-300" : "bg-white/[0.06] text-gray-500"
                    }`}
                  >
                    {checks[item.id] ? "Complete" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={save} className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
            💾 Save Data
          </button>
          <button
            onClick={() => {
              save();
              window.location.href = "/tools/post-sale-documents";
            }}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
          >
            Complete & Return ✓
          </button>
        </div>

        <PageFooter />
      </div>
    </>
  );
}
