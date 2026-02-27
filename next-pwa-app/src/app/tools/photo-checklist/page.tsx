"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

const PHOTO_ITEMS = [
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

const LEGACY_PHOTO_ITEMS = [
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

const MEASUREMENT_REQUIRED = new Set([6, 7, 8, 9, 12, 13, 14, 15]);
const FILE_ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.heif";
const PHOTO_SHORT_LABELS = [
  "House Exterior",
  "Hallway",
  "Wet Area Front",
  "Left Wall",
  "Right Wall",
  "Left Wall Depth",
  "Right Wall Depth",
  "Soap Wall Depth",
  "Ceiling Height",
  "Tub Floor",
  "Ceiling Above Tub",
  "Shower Height",
  "Tub Width",
  "Window Width",
  "Window Height",
];

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

function sanitizeFilePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function customerLastName(name: string): string {
  const clean = name.trim();
  if (!clean) return "Customer";
  const parts = clean.split(/\s+/);
  return sanitizeFilePart(parts[parts.length - 1] || "Customer") || "Customer";
}

function todayStamp(): string {
  return new Date().toISOString().split("T")[0];
}

function buildFileName(customer: string, photoNumber: number, measurement: string): string {
  const name = customerLastName(customer);
  const date = todayStamp();
  const num = String(photoNumber).padStart(2, "0");
  const label = sanitizeFilePart(PHOTO_SHORT_LABELS[photoNumber - 1] || `Photo${num}`);
  const m = sanitizeFilePart(measurement.trim());
  return `${[name, date, num, label, m].filter(Boolean).join(".")}.jpg`;
}

function buildFrameLabel(customer: string, photoNumber: number, measurement: string): string {
  const name = customerLastName(customer);
  const num = String(photoNumber).padStart(2, "0");
  const label = PHOTO_SHORT_LABELS[photoNumber - 1] || `Photo ${num}`;
  return measurement.trim()
    ? `${name} - ${num} - ${label} - ${measurement.trim()}`
    : `${name} - ${num} - ${label}`;
}

function addPhotoFrame(imageData: string, labelText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process image."));
        return;
      }

      const frameHeight = Math.max(44, Math.round(img.height * 0.075));
      canvas.width = img.width;
      canvas.height = img.height + frameHeight;

      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = "rgba(18, 24, 38, 0.92)";
      ctx.fillRect(0, img.height, canvas.width, frameHeight);
      ctx.strokeStyle = "rgba(52, 152, 219, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, img.height);
      ctx.lineTo(canvas.width, img.height);
      ctx.stroke();

      const fontSize = Math.max(14, Math.round(frameHeight * 0.42));
      ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillText(labelText, canvas.width / 2 + 1, img.height + frameHeight / 2 + 1);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(labelText, canvas.width / 2, img.height + frameHeight / 2);

      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = imageData;
  });
}

interface PhotoEntry {
  name: string;
  dataUrl: string | null;
  rawDataUrl?: string | null;
  measurement: string;
  fileName?: string;
}

export default function PhotoChecklistPage() {
  const [photos, setPhotos] = useState<PhotoEntry[]>(
    PHOTO_ITEMS.map((name) => ({ name, dataUrl: null, rawDataUrl: null, measurement: "", fileName: "" }))
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
      const ordered = PHOTO_ITEMS.map((itemName, index) => {
        const match =
          parsed.find((p) => p.name === itemName) ??
          parsed.find((p) => p.name === LEGACY_PHOTO_ITEMS[index]) ??
          parsed[index];
        return {
          name: itemName,
          dataUrl: match?.dataUrl || null,
          rawDataUrl: match?.rawDataUrl || match?.dataUrl || null,
          measurement: match?.measurement || "",
          fileName: match?.fileName || "",
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

  const refreshFramedPhoto = async (index: number, measurement: string) => {
    const current = photos[index];
    if (!current?.rawDataUrl) return;
    const photoNumber = index + 1;
    const label = buildFrameLabel(customerName, photoNumber, measurement);
    const framed = await addPhotoFrame(current.rawDataUrl, label);
    setPhoto(index, {
      dataUrl: framed,
      measurement,
      fileName: buildFileName(customerName, photoNumber, measurement),
    });
  };

  const handlePhotoUpload = async (index: number, file: File) => {
    const rawDataUrl = await toDataUrl(file);
    const photoNumber = index + 1;
    const measurement = photos[index]?.measurement || "";
    const label = buildFrameLabel(customerName, photoNumber, measurement);
    const framed = await addPhotoFrame(rawDataUrl, label);
    setPhoto(index, {
      rawDataUrl,
      dataUrl: framed,
      measurement,
      fileName: buildFileName(customerName, photoNumber, measurement),
    });
  };

  const completed = photos.filter((p) => p.dataUrl).length;

  return (
    <>
      <Navbar title="Photo Checklist" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[1200px] mx-auto px-5 pt-20 pb-10">
        <PageHeader title={`${customerName} - Photos`} subtitle={`${completed}/${PHOTO_ITEMS.length} photos uploaded`} />

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 mb-4">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500 mb-1">Required sequence order</p>
          <p className="text-xs text-gray-600">No camera access required. Choose files from your photo library or Files app.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {photos.map((photo, i) => {
            const photoNumber = i + 1;
            const needsMeasurement = MEASUREMENT_REQUIRED.has(photoNumber);
            return (
            <article key={photo.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white">
                  <span className="text-gray-500 mr-1.5">{photoNumber}.</span>
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
                    setPreviewLabel(`${photoNumber}. ${photo.name}`);
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
                  <span className="text-sm text-gray-600">Choose photo</span>
                )}
              </button>

              <input
                ref={(el) => {
                  fileRefs.current[i] = el;
                }}
                type="file"
                accept={FILE_ACCEPT}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    await handlePhotoUpload(i, f);
                  } catch (err) {
                    alert((err as Error).message || "Could not process this image.");
                  } finally {
                    e.currentTarget.value = "";
                  }
                }}
                className="hidden"
                aria-label={`Upload photo for ${photo.name}`}
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fileRefs.current[i]?.click()}
                  className="px-2 py-2 rounded-md border border-white/[0.15] text-xs text-gray-200"
                >
                  {photo.dataUrl ? "Replace" : "Choose"}
                </button>
                <button
                  onClick={() => setPhoto(i, { dataUrl: null, rawDataUrl: null, fileName: "" })}
                  disabled={!photo.dataUrl}
                  className="px-2 py-2 rounded-md border border-red-500/40 text-xs text-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>

              <label className="block">
                <span className="mb-1 block text-[11px] text-gray-400">
                  Measurement {needsMeasurement ? "(required for this photo)" : "(optional)"}
                </span>
                <input
                  value={photo.measurement}
                  onChange={(e) => setPhoto(i, { measurement: e.target.value })}
                  onBlur={async (e) => {
                    if (!photo.rawDataUrl) return;
                    try {
                      await refreshFramedPhoto(i, e.target.value);
                    } catch (err) {
                      alert((err as Error).message || "Could not apply measurement label.");
                    }
                  }}
                  placeholder='e.g. 32 7/8"'
                  className="w-full rounded-md border border-white/[0.12] bg-black/20 px-2 py-2 text-xs text-gray-100"
                />
              </label>

              {photo.fileName && (
                <p className="text-[11px] text-gray-500 break-all">File: {photo.fileName}</p>
              )}
            </article>
          )})}
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
