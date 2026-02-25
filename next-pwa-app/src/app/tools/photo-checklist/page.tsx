"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

const PHOTO_ITEMS = [
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

interface PhotoEntry {
  name: string;
  dataUrl: string | null;
  measurement: string;
}

export default function PhotoChecklistPage() {
  const [photos, setPhotos] = useState<PhotoEntry[]>(
    PHOTO_ITEMS.map((name) => ({ name, dataUrl: null, measurement: "" }))
  );
  const [customerName, setCustomerName] = useState("Customer");
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const name = localStorage.getItem("currentCustomer");
    if (name) {
      setCustomerName(name);
      const saved = localStorage.getItem(`photos_${name}`);
      if (saved) {
        try { setPhotos(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
  }, []);

  // Auto-save every 10 seconds
  useEffect(() => {
    const name = localStorage.getItem("currentCustomer");
    if (!name) return;
    const timer = setInterval(() => {
      localStorage.setItem(`photos_${name}`, JSON.stringify(photos));
    }, 10000);
    return () => clearInterval(timer);
  }, [photos]);

  const handlePhoto = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = [...photos];
      updated[index] = { ...updated[index], dataUrl: e.target?.result as string };
      setPhotos(updated);
    };
    reader.readAsDataURL(file);
  };

  const completed = photos.filter((p) => p.dataUrl).length;

  return (
    <>
      <Navbar title="Photo Checklist" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[700px] mx-auto px-5 pt-20 pb-10">
        <PageHeader
          title={`${customerName} — Photos`}
          subtitle={`${completed}/${PHOTO_ITEMS.length} photos captured`}
        />

        <div className="space-y-3">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03]"
            >
              {/* Thumbnail / Capture Button */}
              <button
                onClick={() => fileRefs.current[i]?.click()}
                className="flex-shrink-0 w-16 h-16 rounded-lg bg-[#252525] border border-white/[0.08] flex items-center justify-center overflow-hidden"
              >
                {photo.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.dataUrl} alt={photo.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-gray-600">📷</span>
                )}
              </button>
              <input
                ref={(el) => { fileRefs.current[i] = el; }}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhoto(i, f);
                }}
                className="hidden"
                aria-label={`Upload photo for ${photo.name}`}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  <span className="text-gray-600 mr-1.5">{i + 1}.</span>
                  {photo.name}
                </p>
                <input
                  type="text"
                  placeholder="Measurement (optional)"
                  value={photo.measurement}
                  onChange={(e) => {
                    const updated = [...photos];
                    updated[i] = { ...updated[i], measurement: e.target.value };
                    setPhotos(updated);
                  }}
                  className="mt-1 w-full px-2 py-1 rounded bg-transparent border border-white/[0.06] text-xs text-gray-400 placeholder:text-gray-700 focus:outline-none focus:border-brand-500/30"
                />
              </div>

              {/* Status */}
              <span className={`text-lg ${photo.dataUrl ? "text-green-500" : "text-gray-700"}`}>
                {photo.dataUrl ? "✓" : "○"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              const name = localStorage.getItem("currentCustomer");
              if (name) {
                localStorage.setItem(`photos_${name}`, JSON.stringify(photos));
                alert("Photos saved!");
              }
            }}
            className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            💾 Save Photos
          </button>
        </div>

        <PageFooter />
      </div>
    </>
  );
}
