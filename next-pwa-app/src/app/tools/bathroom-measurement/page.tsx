"use client";

import { useState } from "react";
import Image from "next/image";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

interface Measurement {
  label: string;
  value: string;
  unit: string;
}

const DEFAULT_MEASUREMENTS: Measurement[] = [
  { label: "Tub/Shower Length", value: "", unit: "in" },
  { label: "Tub/Shower Width", value: "", unit: "in" },
  { label: "Tub/Shower Height (floor to ceiling)", value: "", unit: "in" },
  { label: "Wall 1 (Left)", value: "", unit: "in" },
  { label: "Wall 2 (Back)", value: "", unit: "in" },
  { label: "Wall 3 (Right)", value: "", unit: "in" },
  { label: "Door/Opening Width", value: "", unit: "in" },
  { label: "Window Width (if applicable)", value: "", unit: "in" },
  { label: "Window Height (if applicable)", value: "", unit: "in" },
  { label: "Distance from floor to window sill", value: "", unit: "in" },
];

export default function BathroomMeasurementPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>(DEFAULT_MEASUREMENTS);
  const [notes, setNotes] = useState("");

  const updateMeasurement = (index: number, value: string) => {
    const updated = [...measurements];
    updated[index] = { ...updated[index], value };
    setMeasurements(updated);
  };

  const filled = measurements.filter((m) => m.value.trim()).length;

  return (
    <>
      <Navbar title="Measurements" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[600px] mx-auto px-5 pt-20 pb-10">
        <PageHeader
          title="Bathroom Measurement"
          subtitle={`${filled}/${measurements.length} measurements entered`}
        />

        {/* Diagram */}
        <div className="mb-6 rounded-xl overflow-hidden border border-white/[0.06]">
          <Image
            src="/images/bathroom-diagram.png"
            alt="Bathroom measurement diagram"
            width={600}
            height={400}
            className="w-full h-auto"
          />
        </div>

        {/* Measurement Fields */}
        <div className="space-y-3">
          {measurements.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03]">
              <span className="text-xs text-gray-500 w-5 text-right">{i + 1}.</span>
              <label className="flex-1 text-sm text-gray-300">{m.label}</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={m.value}
                  onChange={(e) => updateMeasurement(i, e.target.value)}
                  placeholder="—"
                  className="w-20 px-2 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-white text-sm text-right placeholder:text-gray-700 focus:outline-none focus:border-brand-500/40"
                />
                <span className="text-xs text-gray-600">{m.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Additional Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special conditions, damage, plumbing notes..."
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 resize-none"
          />
        </div>

        <div className="mt-6">
          <button
            onClick={() => {
              const name = localStorage.getItem("currentCustomer") || "UNKNOWN";
              const data = { measurements, notes, customerName: name, date: new Date().toISOString() };
              localStorage.setItem(`measurements_${name}`, JSON.stringify(data));
              alert("Measurements saved!");
            }}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            💾 Save Measurements
          </button>
        </div>

        <PageFooter />
      </div>
    </>
  );
}
