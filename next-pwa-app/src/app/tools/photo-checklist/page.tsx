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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState("");
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const name = localStorage.getItem("currentCustomer") || "Customer";
    setCustomerName(name);
    const saved = localStorage.getItem(`photos_${name}`);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<PhotoEntry>[];
      const ordered = PHOTO_ITEMS.map((itemName) => {
        const match = parsed.find((p) => p.name === itemName);
        return {
          name: itemName,
          dataUrl: match?.dataUrl || null,
          measurement: match?.measurement || "",
        };
      });
      setPhotos(ordered);
    } catch {
      // ignore invalid saved data
    }
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("currentCustomer") || customerName;
    localStorage.setItem(`photos_${name}`, JSON.stringify(photos));
  }, [photos, customerName]);

  const setPhoto = (index: number, update: Partial<PhotoEntry>) => {
    const next = [...photos];
    next[index] = { ...next[index], ...update };
    setPhotos(next);
  };

  const handlePhotoUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto(index, { dataUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const completed = photos.filter((p) => p.dataUrl).length;

  return (
    <>
      <Navbar title="Photo Checklist" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[1200px] mx-auto px-5 pt-20 pb-10">
        <PageHeader title={`${customerName} - Photos`} subtitle={`${completed}/${PHOTO_ITEMS.length} photos uploaded`} />

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 mb-4">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500 mb-1">Required sequence order</p>
          <p className="text-xs text-gray-600">Bigger cards for easier quality check. Tap image to zoom, then replace/delete fast.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {photos.map((photo, i) => (
            <article key={photo.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white">
                  <span className="text-gray-500 mr-1.5">{i + 1}.</span>
                  {photo.name}
                </p>
                <span className={`text-[11px] px-2 py-1 rounded-full ${photo.dataUrl ? "bg-green-900/40 text-green-300 border border-green-600/40" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
                  {photo.dataUrl ? "Ready" : "Missing"}
                </span>
              </div>

              <button
                onClick={() => {
                  if (photo.dataUrl) {
                    setPreviewImage(photo.dataUrl);
                    setPreviewLabel(`${i + 1}. ${photo.name}`);
                  } else {
                    fileRefs.current[i]?.click();
                  }
                }}
                className="w-full aspect-[4/3] rounded-lg border border-white/[0.1] bg-[#252525] overflow-hidden flex items-center justify-center"
                title={photo.dataUrl ? "Click to view larger" : "Upload photo"}
              >
                {photo.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.dataUrl} alt={photo.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-gray-600">Upload photo</span>
                )}
              </button>

              <input
                ref={(el) => {
                  fileRefs.current[i] = el;
                }}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhotoUpload(i, f);
                }}
                className="hidden"
                aria-label={`Upload photo for ${photo.name}`}
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fileRefs.current[i]?.click()}
                  className="px-2 py-2 rounded-md border border-white/[0.15] text-xs text-gray-200"
                >
                  {photo.dataUrl ? "Replace" : "Upload"}
                </button>
                <button
                  onClick={() => setPhoto(i, { dataUrl: null })}
                  disabled={!photo.dataUrl}
                  className="px-2 py-2 rounded-md border border-red-500/40 text-xs text-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => {
              const name = localStorage.getItem("currentCustomer") || customerName;
              localStorage.setItem(`photos_${name}`, JSON.stringify(photos));
              alert("Photos saved!");
            }}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            Save Photos
          </button>
        </div>

        {previewImage && (
          <div className="fixed inset-0 z-50 bg-black/80 p-4 flex items-center justify-center" onClick={() => setPreviewImage(null)}>
            <div className="max-w-[1000px] w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white font-semibold">{previewLabel}</p>
                <button onClick={() => setPreviewImage(null)} className="px-2 py-1 rounded bg-white/10 text-white text-xs">Close</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewImage} alt={previewLabel} className="w-full h-auto rounded-lg border border-white/[0.2]" />
            </div>
          </div>
        )}

        <PageFooter />
      </div>
    </>
  );
}
