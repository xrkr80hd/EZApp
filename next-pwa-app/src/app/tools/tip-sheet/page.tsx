"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar, PageFooter, PageHeader } from "@/components/ui";

const PHOTO_SEQUENCE = [
  "Driving up to the house",
  "Hallway leading to the bathroom",
  "Entire wet area – front view",
  "Entire left wall view (remove all peripherals)",
  "Entire right wall view (remove all peripherals)",
  "Measure and photo of left wall depth",
  "Measure and photo of right wall depth",
  "Measure and photo of soap dish wall depth",
  "Measure and photo of ceiling height (FLOOR to CEILING)",
  "Downward photo of bath or tub floor",
  "Entire ceiling above tub",
  "Height of shower above tub",
  "Width of the tub",
  "Window – measure and photo of width",
  "Window – measure and photo of height",
];

const LEGACY_PHOTO_SEQUENCE = [
  "Front of House",
  "Bathroom Entry Door",
  "Full Bathroom Wide Shot",
  "Tub/Shower - Full View",
  "Tub/Shower - Close Up",
  "Faucet & Fixtures",
  "Shower Head",
  "Drain Area",
  "Wall Condition - Left",
  "Wall Condition - Right",
  "Wall Condition - Back",
  "Ceiling Above Tub/Shower",
  "Floor / Base",
  "Vanity Area",
  "Any Damage or Problem Areas",
];

type PhotoEntry = { name: string; dataUrl: string | null; measurement: string };

type TipData = {
  highPrice: string;
  abovePar: string;
  totalDiscount: string;
  priceOffered: string;
  cashOfferAmount: string;
  cashOfferYN: "" | "Yes" | "No";
  financingUpgrade: boolean;
  financingLendhi: boolean;
  financingSynchrony: boolean;
  creditScore: string;
  secondaryOffers: string;
  buyDate13: boolean;
  buyDateWeek: boolean;
  buyDate2Weeks: boolean;
  buyDate1Month: boolean;
  buyDateExact: boolean;
  buyDateNotes: string;
  painPoints: string;
  importantNotes: string;
  callCenterNotes: string;
};

const DEFAULT_TIP: TipData = {
  highPrice: "",
  abovePar: "",
  totalDiscount: "",
  priceOffered: "",
  cashOfferAmount: "",
  cashOfferYN: "",
  financingUpgrade: false,
  financingLendhi: false,
  financingSynchrony: false,
  creditScore: "",
  secondaryOffers: "",
  buyDate13: false,
  buyDateWeek: false,
  buyDate2Weeks: false,
  buyDate1Month: false,
  buyDateExact: false,
  buyDateNotes: "",
  painPoints: "",
  importantNotes: "",
  callCenterNotes: "",
};

export default function TipSheetPage() {
  const [customerName, setCustomerName] = useState("Customer");
  const [tip, setTip] = useState<TipData>(DEFAULT_TIP);
  const [photos, setPhotos] = useState<PhotoEntry[]>(
    PHOTO_SEQUENCE.map((name) => ({ name, dataUrl: null, measurement: "" }))
  );

  const tipKey = useMemo(() => `tipSheet_${customerName}`, [customerName]);
  const photosKey = useMemo(() => `photos_${customerName}`, [customerName]);

  useEffect(() => {
    const current = localStorage.getItem("currentCustomer") || "Customer";
    setCustomerName(current);

    const rawTip = localStorage.getItem(`tipSheet_${current}`);
    if (rawTip) {
      try {
        setTip({ ...DEFAULT_TIP, ...(JSON.parse(rawTip) as Partial<TipData>) });
      } catch {
        // ignore
      }
    }

    const rawPhotos = localStorage.getItem(`photos_${current}`);
    if (rawPhotos) {
      try {
        const parsed = JSON.parse(rawPhotos) as Partial<PhotoEntry>[];
        setPhotos(
          PHOTO_SEQUENCE.map((name, index) => {
            const m =
              parsed.find((p) => p.name === name) ??
              parsed.find((p) => p.name === LEGACY_PHOTO_SEQUENCE[index]) ??
              parsed[index];
            return { name, dataUrl: m?.dataUrl || null, measurement: m?.measurement || "" };
          })
        );
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(tipKey, JSON.stringify(tip));
  }, [tip, tipKey]);

  const setField = <K extends keyof TipData>(k: K, v: TipData[K]) => setTip((p) => ({ ...p, [k]: v }));

  const saveNow = () => {
    localStorage.setItem(tipKey, JSON.stringify(tip));
    localStorage.setItem(photosKey, JSON.stringify(photos));
    alert("Tip sheet saved.");
  };

  return (
    <>
      <Navbar title="Tip Sheet" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[1100px] mx-auto px-5 pt-20 pb-10 space-y-5">
        <PageHeader title="TIP SHEET" subtitle="$500 FOR 5 MINUTES!" />

        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Pricing">
            <L label="High Price" value={tip.highPrice} onChange={(v) => setField("highPrice", v)} />
            <L label="Above PAR" value={tip.abovePar} onChange={(v) => setField("abovePar", v)} />
            <L label="Total Discount" value={tip.totalDiscount} onChange={(v) => setField("totalDiscount", v)} />
            <L label="Price Offered" value={tip.priceOffered} onChange={(v) => setField("priceOffered", v)} />
            <div className="grid grid-cols-[1fr_120px] gap-2">
              <L label="Cash Offer $" value={tip.cashOfferAmount} onChange={(v) => setField("cashOfferAmount", v)} />
              <Select
                label="Y / N"
                value={tip.cashOfferYN}
                onChange={(v) => setField("cashOfferYN", v as "" | "Yes" | "No")}
                options={["Yes", "No"]}
              />
            </div>
          </Card>

          <Card title="Financing">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Toggle label="Upgrade" value={tip.financingUpgrade} onChange={(v) => setField("financingUpgrade", v)} />
              <Toggle label="Lendhi" value={tip.financingLendhi} onChange={(v) => setField("financingLendhi", v)} />
              <Toggle label="Synchrony" value={tip.financingSynchrony} onChange={(v) => setField("financingSynchrony", v)} />
            </div>
            <L label="Credit Score" value={tip.creditScore} onChange={(v) => setField("creditScore", v)} />
            <T label="Any Secondary Offers" rows={4} value={tip.secondaryOffers} onChange={(v) => setField("secondaryOffers", v)} />
          </Card>

          <Card title="Clear Future Buy Date">
            <div className="grid grid-cols-2 gap-2">
              <Toggle label="1-3 Days" value={tip.buyDate13} onChange={(v) => setField("buyDate13", v)} />
              <Toggle label="1 Week" value={tip.buyDateWeek} onChange={(v) => setField("buyDateWeek", v)} />
              <Toggle label="2 Weeks" value={tip.buyDate2Weeks} onChange={(v) => setField("buyDate2Weeks", v)} />
              <Toggle label="1 Month" value={tip.buyDate1Month} onChange={(v) => setField("buyDate1Month", v)} />
              <Toggle label="Exact Date" value={tip.buyDateExact} onChange={(v) => setField("buyDateExact", v)} />
            </div>
            <T label="Date / Timing Notes" rows={3} value={tip.buyDateNotes} onChange={(v) => setField("buyDateNotes", v)} />
          </Card>

          <Card title="Pain Points / Important Notes">
            <T label="Pain Points" rows={3} value={tip.painPoints} onChange={(v) => setField("painPoints", v)} />
            <T label="Important Notes" rows={3} value={tip.importantNotes} onChange={(v) => setField("importantNotes", v)} />
          </Card>
        </div>

        <section className="rounded-xl border border-white/[0.08] bg-[#dfe6fb] p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[#1f2a44] mb-2">Call Center Rehash Notes</h3>
          <textarea
            rows={5}
            value={tip.callCenterNotes}
            onChange={(e) => setField("callCenterNotes", e.target.value)}
            className="w-full rounded-md border border-[#9aa8ca] bg-white px-2 py-2 text-sm text-[#1d2438]"
          />
        </section>

        <Card title="Photo Sequence (Read Only)">
          <p className="text-xs text-gray-500">Manage photo changes in Photo Checklist.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <div key={photo.name} className="rounded-lg border border-white/[0.1] bg-white/[0.02] p-2">
                <p className="text-xs text-gray-300 truncate mb-1">
                  {i + 1}. {photo.name}
                </p>
                <div className="w-full aspect-video rounded-md overflow-hidden border border-white/[0.12] bg-[#1f1f1f] flex items-center justify-center">
                  {photo.dataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.dataUrl} alt={photo.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500">Upload photo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <button onClick={saveNow} className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold">
          Save Tip Sheet
        </button>

        <PageFooter />
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-300 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function L({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-300 mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/[0.12] bg-black/20 px-2 py-2 text-sm text-gray-100"
      />
    </label>
  );
}

function T({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-300 mb-1">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/[0.12] bg-black/20 px-2 py-2 text-sm text-gray-100"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-300 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/[0.12] bg-black/20 px-2 py-2 text-sm text-gray-100"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`rounded-md border px-3 py-2 text-xs text-left ${
        value ? "border-brand-500/60 bg-brand-500/20 text-white" : "border-white/[0.15] text-gray-300"
      }`}
    >
      {value ? "[x] " : "[ ] "}
      {label}
    </button>
  );
}
