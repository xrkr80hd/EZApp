"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Navbar, PageFooter, PageHeader } from "@/components/ui";

type PhotoEntry = {
  id?: number;
  name?: string;
  description?: string;
  dataUrl?: string | null;
  measurement?: string;
};

type FormData = {
  customerName: string;
  measurementDate: string;
  measuredBy: string;
  jobNumber: string;
  product: string;
  productColor: string;
  productSize: string;
  doorOrientation: string;
  reversePlumbing: "Yes" | "No";
  wall3Sided: boolean;
  wall2Sided: boolean;
  wallOther: boolean;
  doorRemove: boolean;
  doorReverse: boolean;
  doorWiden: boolean;
  electricalPanel: string;
  breakerSpace: "Yes" | "No" | "";
  measureA: string;
  measureB: string;
  measureC: string;
  measureD: string;
  measureE: string;
  measureF: string;
  measureG: string;
  measureH: string;
  windowKit: string;
  additionalNotes: string;
  sideViewPhoto: string | null;
  floorPlanPhoto: string | null;
};

const DEFAULT_FORM: FormData = {
  customerName: "",
  measurementDate: "",
  measuredBy: "",
  jobNumber: "",
  product: "",
  productColor: "",
  productSize: "",
  doorOrientation: "",
  reversePlumbing: "No",
  wall3Sided: false,
  wall2Sided: false,
  wallOther: false,
  doorRemove: false,
  doorReverse: false,
  doorWiden: false,
  electricalPanel: "",
  breakerSpace: "",
  measureA: "",
  measureB: "",
  measureC: "",
  measureD: "",
  measureE: "",
  measureF: "",
  measureG: "",
  measureH: "",
  windowKit: "",
  additionalNotes: "",
  sideViewPhoto: null,
  floorPlanPhoto: null,
};

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function BathroomMeasurementPage() {
  const [form, setForm] = useState<FormData>({ ...DEFAULT_FORM, measurementDate: todayISO() });
  const [importedPhotos, setImportedPhotos] = useState<PhotoEntry[]>([]);
  const [customerName, setCustomerName] = useState("Customer");

  const measurementCount = useMemo(() => {
    const vals = [
      form.measureA,
      form.measureB,
      form.measureC,
      form.measureD,
      form.measureE,
      form.measureF,
      form.measureG,
      form.measureH,
    ];
    return vals.filter((v) => v.trim()).length;
  }, [form]);

  useEffect(() => {
    const current = localStorage.getItem("currentCustomer") || "Customer";
    setCustomerName(current);

    const saved = localStorage.getItem(`bathroomMeasurement_${current}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<FormData>;
        setForm((prev) => ({
          ...prev,
          ...parsed,
          customerName: parsed.customerName || current,
          measurementDate: parsed.measurementDate || todayISO(),
        }));
      } catch {
        setForm((prev) => ({ ...prev, customerName: current, measurementDate: todayISO() }));
      }
    } else {
      setForm((prev) => ({ ...prev, customerName: current, measurementDate: todayISO() }));
    }

    loadAndPopulateFromPhotos(current);
  }, []);

  const loadAndPopulateFromPhotos = (current: string) => {
    const fromChecklistRaw = localStorage.getItem(`photos_${current}`);
    let checklistPhotos: PhotoEntry[] = [];
    if (fromChecklistRaw) {
      try {
        checklistPhotos = JSON.parse(fromChecklistRaw) as PhotoEntry[];
      } catch {
        checklistPhotos = [];
      }
    }

    const ezRaw = localStorage.getItem("EZAPP_current");
    let ezPhotos: PhotoEntry[] = [];
    if (ezRaw) {
      try {
        const ez = JSON.parse(ezRaw) as { photos?: PhotoEntry[] };
        ezPhotos = Array.isArray(ez.photos) ? ez.photos : [];
      } catch {
        ezPhotos = [];
      }
    }

    const merged = [...checklistPhotos, ...ezPhotos].filter(
      (p) => (p.measurement && p.measurement.trim()) || p.dataUrl
    );
    setImportedPhotos(merged);

    setForm((prev) => {
      const next = { ...prev };
      for (const photo of merged) {
        const d = (photo.description || "").toLowerCase();
        const n = (photo.name || "").toLowerCase();
        const m = (photo.measurement || "").trim();
        if (!m) continue;

        // Preserve the old working mapping rules from your prior build:
        // Photo 6 / left wall depth -> B
        // Photo 7 / right wall depth -> E
        // Photo 8 / soap dish wall depth -> D
        if (photo.id === 6 || d.includes("left wall depth") || n.includes("wall condition - left")) {
          next.measureB = m;
        }
        if (photo.id === 7 || d.includes("right wall depth") || n.includes("wall condition - right")) {
          next.measureE = m;
        }
        if (photo.id === 8 || d.includes("soap dish") || n.includes("drain area")) {
          next.measureD = m;
        }
      }
      return next;
    });
  };

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadDrawing = (file: File, target: "sideViewPhoto" | "floorPlanPhoto") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm((prev) => ({ ...prev, [target]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const saveForm = () => {
    const keyCustomer = form.customerName || customerName || "Customer";
    const payload = {
      ...form,
      customerName: keyCustomer,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(`bathroomMeasurement_${keyCustomer}`, JSON.stringify(payload));

    const ezRaw = localStorage.getItem("EZAPP_current");
    try {
      const ez = ezRaw ? (JSON.parse(ezRaw) as Record<string, unknown>) : {};
      const documents = (ez.documents as Record<string, unknown>) || {};
      documents.bathroomMeasurement = payload;
      ez.documents = documents;
      localStorage.setItem("EZAPP_current", JSON.stringify(ez));
    } catch {
      // no-op
    }

    alert("Bathroom Measurement Form saved successfully.");
  };

  const autoFillAgain = () => {
    const current = localStorage.getItem("currentCustomer") || customerName || "Customer";
    loadAndPopulateFromPhotos(current);
    alert("Re-applied photo checklist measurements.");
  };

  return (
    <>
      <Navbar title="Bathroom Measurement" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[1100px] mx-auto px-5 pt-20 pb-10">
        <PageHeader
          title="Bathroom Measurement Form"
          subtitle={`${measurementCount}/8 detailed measurements entered`}
        />

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 md:p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Customer Name" value={form.customerName} onChange={(v) => setField("customerName", v)} />
            <Input
              label="Date"
              type="date"
              value={form.measurementDate}
              onChange={(v) => setField("measurementDate", v)}
            />
            <Input label="Measured By" value={form.measuredBy} onChange={(v) => setField("measuredBy", v)} />
            <Input label="Job Number" value={form.jobNumber} onChange={(v) => setField("jobNumber", v)} />
          </div>

          <SectionTitle text="Product Information" />
          <div className="grid md:grid-cols-2 gap-3">
            <Select
              label="Product"
              value={form.product}
              onChange={(v) => setField("product", v)}
              options={["Tub", "Shower", "Walk-In Tub", "Tub to Shower Conversion"]}
            />
            <Input label="Color" value={form.productColor} onChange={(v) => setField("productColor", v)} />
            <Input
              label="Size (L × W × H)"
              value={form.productSize}
              onChange={(v) => setField("productSize", v)}
              placeholder="e.g., 60 × 32 × 58"
            />
            <Select
              label="Door Orientation"
              value={form.doorOrientation}
              onChange={(v) => setField("doorOrientation", v)}
              options={["Right Hand (RH)", "Left Hand (LH)", "N/A"]}
            />
          </div>

          <SectionTitle text="Installation Options" />
          <div className="grid md:grid-cols-3 gap-3">
            <RadioGroup
              label="Reverse Plumbing"
              value={form.reversePlumbing}
              onChange={(v) => setField("reversePlumbing", v as "Yes" | "No")}
              options={["Yes", "No"]}
            />
            <CheckGroup
              label="Wall Surround"
              items={[
                { label: "3-Sided", checked: form.wall3Sided, onChange: (v) => setField("wall3Sided", v) },
                { label: "2-Sided", checked: form.wall2Sided, onChange: (v) => setField("wall2Sided", v) },
                { label: "Other", checked: form.wallOther, onChange: (v) => setField("wallOther", v) },
              ]}
            />
            <CheckGroup
              label="Door Modifications"
              items={[
                { label: "Remove Door", checked: form.doorRemove, onChange: (v) => setField("doorRemove", v) },
                { label: "Reverse Door Swing", checked: form.doorReverse, onChange: (v) => setField("doorReverse", v) },
                { label: "Widen Door Frame", checked: form.doorWiden, onChange: (v) => setField("doorWiden", v) },
              ]}
            />
          </div>

          <SectionTitle text="Electrical Information" />
          <div className="grid md:grid-cols-2 gap-3">
            <Select
              label="Electrical Panel Type"
              value={form.electricalPanel}
              onChange={(v) => setField("electricalPanel", v)}
              options={["Standard Circuit Breaker", "Fuse Box", "Subpanel"]}
            />
            <RadioGroup
              label="Breaker Space Available"
              value={form.breakerSpace}
              onChange={(v) => setField("breakerSpace", v as "Yes" | "No")}
              options={["Yes", "No"]}
            />
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
            <p className="text-sm font-semibold text-white text-center mb-3">Measurement Diagram</p>
            <Image
              src="/images/bathroom-diagram.png"
              alt="Bathroom measurement diagram"
              width={900}
              height={550}
              className="w-full h-auto rounded-lg border border-white/[0.08]"
            />
          </div>

          <SectionTitle text="Detailed Measurements (in inches)" />
          <div className="grid md:grid-cols-2 gap-3">
            <Measurement label="A. L Sidewall Height" value={form.measureA} onChange={(v) => setField("measureA", v)} />
            <Measurement label="B. L Sidewall Depth" value={form.measureB} onChange={(v) => setField("measureB", v)} />
            <Measurement
              label="C. Soap Dish Wall Height"
              value={form.measureC}
              onChange={(v) => setField("measureC", v)}
            />
            <Measurement
              label="D. Soap Dish Wall Width"
              value={form.measureD}
              onChange={(v) => setField("measureD", v)}
            />
            <Measurement label="E. R Sidewall Depth" value={form.measureE} onChange={(v) => setField("measureE", v)} />
            <Measurement
              label="F. R Sidewall Height"
              value={form.measureF}
              onChange={(v) => setField("measureF", v)}
            />
            <Measurement label="G. L Leg Depth" value={form.measureG} onChange={(v) => setField("measureG", v)} />
            <Measurement label="H. R Leg Depth" value={form.measureH} onChange={(v) => setField("measureH", v)} />
          </div>

          <Input
            label="Window Kit Size"
            value={form.windowKit}
            onChange={(v) => setField("windowKit", v)}
            placeholder="e.g., 24 x 36"
          />

          <SectionTitle text="Imported From Photo Checklist" />
          <div className="rounded-xl border border-white/[0.08] bg-black/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-300">{importedPhotos.length} photo entries found</p>
              <button
                onClick={autoFillAgain}
                className="px-3 py-1.5 rounded-md border border-brand-500/40 text-brand-300 text-xs"
              >
                Re-Apply Mapping
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {importedPhotos.map((photo, i) => (
                <div key={`${photo.name || "photo"}-${i}`} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2">
                  <div className="aspect-video rounded-md overflow-hidden bg-[#1f1f1f] flex items-center justify-center mb-2">
                    {photo.dataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.dataUrl} alt={photo.name || "Imported photo"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">No image</span>
                    )}
                  </div>
                  <p className="text-xs text-white truncate">{photo.name || photo.description || `Photo ${i + 1}`}</p>
                  <p className="text-xs text-gray-400 truncate">Measurement: {photo.measurement || "-"}</p>
                </div>
              ))}
            </div>
          </div>

          <SectionTitle text="Drawing / Reference Photos" />
          <div className="grid md:grid-cols-2 gap-4">
            <DrawingUpload
              title="New Product - Side View"
              image={form.sideViewPhoto}
              onFile={(file) => uploadDrawing(file, "sideViewPhoto")}
              onClear={() => setField("sideViewPhoto", null)}
            />
            <DrawingUpload
              title="New Bathroom Floor Plan"
              image={form.floorPlanPhoto}
              onFile={(file) => uploadDrawing(file, "floorPlanPhoto")}
              onClear={() => setField("floorPlanPhoto", null)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-1">Additional Notes / Special Instructions</label>
            <textarea
              rows={4}
              value={form.additionalNotes}
              onChange={(e) => setField("additionalNotes", e.target.value)}
              className="w-full rounded-lg border border-white/[0.12] bg-black/20 px-3 py-2 text-sm text-gray-200"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={autoFillAgain}
              className="px-4 py-2 rounded-lg border border-white/[0.2] text-gray-100 text-sm"
            >
              Auto-Fill from Photo Checklist
            </button>
            <button onClick={saveForm} className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm">
              Save Measurement Form
            </button>
          </div>
        </div>

        <PageFooter />
      </div>
    </>
  );
}

function SectionTitle({ text }: { text: string }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-300 border-b border-white/[0.08] pb-1">{text}</p>;
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date";
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-300 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/[0.12] bg-black/20 px-3 py-2 text-sm text-gray-100"
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
        className="w-full rounded-lg border border-white/[0.12] bg-black/20 px-3 py-2 text-sm text-gray-100"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function Measurement({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-300 mb-1">{label}</span>
      <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="inches"
          className="w-full rounded-lg border border-white/[0.12] bg-black/20 px-3 py-2 text-sm text-gray-100"
        />
        <span className="text-xs text-gray-400">in</span>
      </div>
    </label>
  );
}

function RadioGroup({
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
    <div>
      <p className="text-xs text-gray-300 mb-1">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-md text-xs border ${
              value === opt ? "border-brand-500/60 bg-brand-500/20 text-white" : "border-white/[0.15] text-gray-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckGroup({
  label,
  items,
}: {
  label: string;
  items: { label: string; checked: boolean; onChange: (value: boolean) => void }[];
}) {
  return (
    <div>
      <p className="text-xs text-gray-300 mb-1">{label}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <label key={item.label} className="flex items-center gap-2 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => item.onChange(e.target.checked)}
              className="h-4 w-4"
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function DrawingUpload({
  title,
  image,
  onFile,
  onClear,
}: {
  title: string;
  image: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/[0.1] bg-black/20 p-3 space-y-2">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="aspect-video rounded-lg border border-dashed border-white/[0.2] bg-[#191919] overflow-hidden flex items-center justify-center">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-gray-500">Upload image</span>
        )}
      </div>
      <div className="flex gap-2">
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
            className="hidden"
          />
          <span className="block text-center px-3 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs cursor-pointer">
            Upload
          </span>
        </label>
        <button onClick={onClear} className="px-3 py-2 rounded-md border border-red-500/50 text-red-300 text-xs">
          Clear
        </button>
      </div>
    </div>
  );
}
