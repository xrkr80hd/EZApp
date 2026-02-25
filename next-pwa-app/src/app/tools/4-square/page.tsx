"use client";

import { useEffect, useState } from "react";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

const QUADRANTS = [
  { title: "Their Story", prompt: "What brought them to this point? Family, lifestyle, frustrations..." },
  { title: "Our Story", prompt: "Company history, values, what makes us different..." },
  { title: "The Product", prompt: "Features, benefits, quality, warranty, timeline..." },
  { title: "The Investment", prompt: "Pricing, financing options, value proposition..." },
];

export default function FourSquarePage() {
  const [customerName, setCustomerName] = useState("Customer");
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    const name = localStorage.getItem("currentCustomer");
    if (name) {
      setCustomerName(name);
      const saved = localStorage.getItem(`foursquare_${name}`);
      if (saved) {
        try { setNotes(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
  }, []);

  return (
    <>
      <Navbar title="4-Square" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[800px] mx-auto px-5 pt-20 pb-10">
        <PageHeader title={`${customerName} — 4-Square`} subtitle="Build rapport and close" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUADRANTS.map((q, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.03]">
              <h3 className="text-sm font-bold text-white mb-1">🎯 {q.title}</h3>
              <p className="text-xs text-gray-600 mb-3">{q.prompt}</p>
              <textarea
                rows={5}
                value={notes[i] || ""}
                onChange={(e) => setNotes({ ...notes, [i]: e.target.value })}
                placeholder="Notes..."
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 resize-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => {
              const name = localStorage.getItem("currentCustomer");
              if (name) {
                localStorage.setItem(`foursquare_${name}`, JSON.stringify(notes));
                alert("4-Square saved!");
              }
            }}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            💾 Save
          </button>
        </div>

        <PageFooter />
      </div>
    </>
  );
}
