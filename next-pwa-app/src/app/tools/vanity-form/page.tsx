"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar, PageFooter, PageHeader } from "@/components/ui";

type BowlStyle = "venetian" | "oval" | "none";

type VanityForm = {
  orderForm: string;
  length: string;
  depth: string;
  specialSize: string;
  creditNote: string;
  lavatoryDeckColor: string;
  bowlColor: string;
  specialInstructions: string;
  bowlStyle: BowlStyle;
};

const DEFAULT_FORM: VanityForm = {
  orderForm: "",
  length: "",
  depth: "",
  specialSize: "",
  creditNote: "",
  lavatoryDeckColor: "",
  bowlColor: "",
  specialInstructions: "",
  bowlStyle: "venetian",
};

export default function VanityFormPage() {
  const [customerName, setCustomerName] = useState("Customer");
  const [form, setForm] = useState<VanityForm>(DEFAULT_FORM);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const key = useMemo(() => `vanityForm_${customerName}`, [customerName]);

  useEffect(() => {
    const current = localStorage.getItem("currentCustomer") || "Customer";
    setCustomerName(current);
    const raw = localStorage.getItem(`vanityForm_${current}`);
    if (!raw) return;
    try {
      setForm({ ...DEFAULT_FORM, ...(JSON.parse(raw) as Partial<VanityForm>) });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(form));
  }, [form, key]);

  const setField = <K extends keyof VanityForm>(k: K, v: VanityForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const generateFilledForm = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = "/images/onyx-form.jpg";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load Onyx template image"));
    });

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const redCircle = new Image();
    redCircle.src = "/images/red_circle.png";
    await new Promise<void>((resolve, reject) => {
      redCircle.onload = () => resolve();
      redCircle.onerror = () => reject(new Error("Failed to load red circle asset"));
    });

    ctx.fillStyle = "#111";
    ctx.font = "16px Arial";

    // Basic typed values
    ctx.fillText(form.orderForm, 700, 54);
    ctx.fillText(form.length, 220, 122);
    ctx.fillText(form.depth, 220, 160);
    ctx.fillText(form.specialSize, 650, 162);
    ctx.fillText(form.lavatoryDeckColor, 235, 793);
    ctx.fillText(form.bowlColor, 230, 828);

    // Special notes box
    drawWrappedText(ctx, form.specialInstructions, 30, 885, 740, 20);

    // Bowl selection circles
    // Venetian center
    drawRedCircle(ctx, redCircle, 202, 546, form.bowlStyle === "venetian", 72);
    // Oval center
    drawRedCircle(ctx, redCircle, 406, 546, form.bowlStyle === "oval", 72);
    // No bowl checkbox
    drawRedCircle(ctx, redCircle, 527, 480, form.bowlStyle === "none", 40);

    // Optional little credit/note line
    ctx.font = "14px Arial";
    ctx.fillText(form.creditNote, 430, 230);
  };

  const downloadResult = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await generateFilledForm();
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${customerName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Onyx_Lavatory_Form.png`;
    a.click();
  };

  return (
    <>
      <Navbar title="Vanity Form" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[1100px] mx-auto px-5 pt-20 pb-10 space-y-5">
        <PageHeader title="Onyx Lavatory Order Form" subtitle="Same function, clearer field-to-form mapping" />

        <div className="rounded-xl border border-[#2b4f86] bg-[#0d1a2b] p-3 text-sm text-[#c5d9ff]">
          <p className="font-semibold text-[#8dc0ff] mb-1">How to fill this</p>
          <p>Use the left panel in this order: <strong>Size</strong> {"->"} <strong>Colors</strong> {"->"} <strong>Bowl Style</strong> {"->"} <strong>Notes</strong>. Each label matches the same section name on the printed Onyx form.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="rounded-xl border border-[#274c82] bg-[#081221] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#9dc8ff]">Input</h3>
            <div className="rounded-lg border border-[#355f9d] bg-[#10233d] p-3 space-y-2">
              <p className="text-xs uppercase tracking-[0.12em] text-[#9dc8ff] font-semibold">Order Header</p>
              <Field label="Order Form # (top-right box)" value={form.orderForm} onChange={(v) => setField("orderForm", v)} />
            </div>

            <div className="rounded-lg border border-[#355f9d] bg-[#10233d] p-3 space-y-2">
              <p className="text-xs uppercase tracking-[0.12em] text-[#9dc8ff] font-semibold">1) Size Section</p>
              <Field label="Length of Lavatory" value={form.length} onChange={(v) => setField("length", v)} />
              <Field label="Depth of Lavatory" value={form.depth} onChange={(v) => setField("depth", v)} />
              <Field label="Special Size" value={form.specialSize} onChange={(v) => setField("specialSize", v)} />
            </div>

            <div className="rounded-lg border border-[#355f9d] bg-[#10233d] p-3 space-y-2">
              <p className="text-xs uppercase tracking-[0.12em] text-[#9dc8ff] font-semibold">2) Color Section</p>
              <Field label="Lavatory Deck Color" value={form.lavatoryDeckColor} onChange={(v) => setField("lavatoryDeckColor", v)} />
              <Field label="Bowl(s) Color" value={form.bowlColor} onChange={(v) => setField("bowlColor", v)} />
            </div>

            <div className="rounded-lg border border-[#355f9d] bg-[#10233d] p-3 space-y-2">
              <p className="text-xs uppercase tracking-[0.12em] text-[#9dc8ff] font-semibold">3) Bowl / Notes</p>
              <Field label="Additional Note (small line)" value={form.creditNote} onChange={(v) => setField("creditNote", v)} />
              <div className="grid grid-cols-3 gap-2">
                <Toggle label="Venetian" active={form.bowlStyle === "venetian"} onClick={() => setField("bowlStyle", "venetian")} />
                <Toggle label="Oval" active={form.bowlStyle === "oval"} onClick={() => setField("bowlStyle", "oval")} />
                <Toggle label="No Bowl" active={form.bowlStyle === "none"} onClick={() => setField("bowlStyle", "none")} />
              </div>
              <label className="block">
                <span className="block text-xs text-[#d7e8ff] mb-1">Special Instructions (bottom notes area)</span>
                <textarea
                  rows={4}
                  value={form.specialInstructions}
                  onChange={(e) => setField("specialInstructions", e.target.value)}
                  className="w-full rounded-md border border-[#4f79b4] bg-[#dceaff] px-2 py-2 text-sm text-[#0d1a2b]"
                />
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generateFilledForm}
                className="flex-1 px-3 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-sm"
              >
                Generate Filled Form
              </button>
              <button
                onClick={downloadResult}
                className="flex-1 px-3 py-2 rounded-md border border-brand-500/40 text-brand-300 text-sm"
              >
                Download PNG
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[#274c82] bg-[#081221] p-3">
            <p className="text-xs text-[#9dc8ff] mb-2">Preview</p>
            <canvas ref={canvasRef} className="w-full h-auto rounded-lg border border-white/[0.08] bg-[#111]" />
          </section>
        </div>

        <PageFooter />
      </div>
    </>
  );
}

function drawRedCircle(
  ctx: CanvasRenderingContext2D,
  circleAsset: HTMLImageElement,
  x: number,
  y: number,
  active: boolean,
  size = 48
) {
  if (!active) return;
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.drawImage(circleAsset, x - size / 2, y - size / 2, size, size);
  ctx.restore();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  if (!text.trim()) return;
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-300 mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[#4f79b4] bg-[#dceaff] px-2 py-2 text-sm text-[#0d1a2b]"
      />
    </label>
  );
}

function Toggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-2 py-2 text-xs ${
        active ? "border-[#8cc2ff] bg-[#2d5f9b] text-white" : "border-[#4f79b4] bg-[#dceaff] text-[#0d1a2b]"
      }`}
    >
      {label}
    </button>
  );
}
