"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BackLink, PageFooter } from "@/components/ui";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;
const SLOTS = ["M", "A", "E"] as const;
const MIN_WEEKLY_SLOTS = 15;
const MIN_SATURDAY_MONTHLY = 6;
const MAX_EVENING_OFF = 3;

type Grid = Record<string, boolean>;

function getNextMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function formatDateRange(startDate: string): string {
  if (!startDate) return "";
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
}

function formatWeekRangeCompact(startDate: string): string {
  if (!startDate) return "________________";
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const mmdd = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  return `${mmdd(start)} - ${mmdd(end)}`;
}

export default function SchedulerPage() {
  const [name, setName] = useState("");
  const [weekStart, setWeekStart] = useState(getNextMonday);
  const [grid, setGrid] = useState<Grid>({});
  const [saturdayCount, setSaturdayCount] = useState(6);
  const [vacation, setVacation] = useState(false);
  const [vacationOpen, setVacationOpen] = useState(false);
  const [vacStart, setVacStart] = useState("");
  const [vacEnd, setVacEnd] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [busyAction, setBusyAction] = useState<"save" | "share" | null>(null);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("scheduler_data");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.name) setName(d.name);
        if (d.weekStart) setWeekStart(d.weekStart);
        if (d.grid) setGrid(d.grid);
        if (d.saturdayCount) setSaturdayCount(d.saturdayCount);
        if (d.vacation) setVacation(d.vacation);
        if (d.vacStart) setVacStart(d.vacStart);
        if (d.vacEnd) setVacEnd(d.vacEnd);
        if (d.vacation || d.vacStart || d.vacEnd) setVacationOpen(true);
      } catch { /* ignore */ }
    }
  }, []);

  // Auto-save every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(
        "scheduler_data",
        JSON.stringify({ name, weekStart, grid, saturdayCount, vacation, vacStart, vacEnd })
      );
    }, 10000);
    return () => clearInterval(timer);
  }, [name, weekStart, grid, saturdayCount, vacation, vacStart, vacEnd]);

  const toggleSlot = useCallback((day: string, slot: string) => {
    const key = `${day}-${slot}`;
    setGrid((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Counts
  const openSlots = Object.values(grid).filter(Boolean).length;
  const eveningOff = DAYS.filter((d) => !grid[`${d}-E`]).length;
  const meetsWeekly = openSlots >= MIN_WEEKLY_SLOTS;
  const meetsEvening = eveningOff <= MAX_EVENING_OFF;
  const weekRangeCompact = formatWeekRangeCompact(weekStart);
  const vacationDisplay = vacation
    ? vacStart && vacEnd
      ? `${new Date(vacStart + "T00:00:00").toLocaleDateString()} - ${new Date(vacEnd + "T00:00:00").toLocaleDateString()}`
      : "_________"
    : "None Scheduled";

  const captureScheduleBlob = useCallback(async () => {
    if (!showPreview) {
      setShowPreview(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!exportRef.current) {
      throw new Error("Scheduler view not ready.");
    }
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Could not create image."));
      }, "image/png");
    });

    return blob;
  }, [showPreview]);

  const getScheduleFileName = useCallback(() => {
    const cleanName = (name || "CONSULTANT").replace(/\s+/g, "_").toUpperCase();
    const date = weekStart || new Date().toISOString().split("T")[0];
    return `EZBATHS_SCHEDULE_${cleanName}_${date}.png`;
  }, [name, weekStart]);

  const saveScheduleImage = useCallback(async () => {
    try {
      setBusyAction("save");
      const blob = await captureScheduleBlob();
      const filename = getScheduleFileName();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert((err as Error).message || "Could not save schedule image.");
    } finally {
      setBusyAction(null);
    }
  }, [captureScheduleBlob, getScheduleFileName]);

  const shareScheduleImage = useCallback(async () => {
    try {
      setBusyAction("share");
      const blob = await captureScheduleBlob();
      const filename = getScheduleFileName();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "EZ Baths Weekly Schedule",
          text: "Weekly availability schedule",
          files: [file],
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      alert("Share not available on this device. Downloaded image instead.");
    } catch (err) {
      alert((err as Error).message || "Could not share schedule image.");
    } finally {
      setBusyAction(null);
    }
  }, [captureScheduleBlob, getScheduleFileName]);

  return (
    <div className="min-h-screen px-4 py-5">
      <div className="max-w-[1100px] mx-auto bg-[#1e1e1e]/[0.98] rounded-2xl overflow-hidden shadow-2xl">
        <div>
        {/* Form Header */}
        <div className="bg-gradient-to-br from-[#2c3e50] to-[#34495e] px-6 py-8">
          <BackLink href="/" label="← Home" />
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Weekly Scheduler</h1>
            <p className="text-sm text-gray-300 mt-1">Select your available appointment times</p>
          </div>

          {/* Info Fields */}
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label htmlFor="consultantName" className="block text-xs text-gray-300 mb-1">👤 Consultant Name</label>
              <input
                id="consultantName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label htmlFor="weekStart" className="block text-xs text-gray-300 mb-1">📅 Week Starting (Monday)</label>
              <input
                id="weekStart"
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                title="Select week start date"
                className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30"
              />
              {weekStart && (
                <p className="text-xs text-gray-400 mt-1">{formatDateRange(weekStart)}</p>
              )}
            </div>

            {/* Vacation Toggle */}
            <div className="rounded-lg border border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => {
                  const nextOpen = !vacationOpen;
                  setVacationOpen(nextOpen);
                  setVacation(nextOpen);
                  if (!nextOpen) {
                    setVacStart("");
                    setVacEnd("");
                  }
                }}
                className="w-full px-3 py-2.5 text-left flex items-center justify-between text-sm text-gray-200 hover:bg-white/5 transition-colors rounded-lg"
                aria-expanded={vacationOpen}
                aria-controls="vacation-accordion"
              >
                <span>🏖️ Vacation Dates (Optional)</span>
                <span className={`transition-transform ${vacationOpen ? "rotate-180" : ""}`}>▼</span>
              </button>

              {vacationOpen && (
                <div id="vacation-accordion" className="px-3 pb-3">
                  <p className="text-xs text-amber-300 mb-2">
                    Must notify office 30 days prior to vacation date.
                  </p>
                  <div className="flex gap-3 items-center">
                    <div className="flex-1">
                      <label htmlFor="vacStart" className="block text-xs text-gray-400 mb-1">Start</label>
                      <input
                        id="vacStart"
                        type="date"
                        value={vacStart}
                        onChange={(e) => setVacStart(e.target.value)}
                        title="Vacation start date"
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <span className="text-gray-500 mt-5">→</span>
                    <div className="flex-1">
                      <label htmlFor="vacEnd" className="block text-xs text-gray-400 mb-1">End</label>
                      <input
                        id="vacEnd"
                        type="date"
                        value={vacEnd}
                        onChange={(e) => setVacEnd(e.target.value)}
                        title="Vacation end date"
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Requirements Counters */}
          <div className="mt-6 p-4 rounded-xl bg-white/[0.06] border border-white/[0.08] max-w-md mx-auto">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📊 Requirements</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Weekly Slots Open</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${meetsWeekly ? "text-green-400" : "text-red-400"}`}>
                    {openSlots}/{MIN_WEEKLY_SLOTS} min
                  </span>
                  <span className="text-xs">{meetsWeekly ? "✓" : "✗"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Saturday Slots (Monthly)</span>
                <div className="flex gap-1">
                  {Array.from({ length: 15 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setSaturdayCount(i + 1)}
                      className={`w-5 h-5 rounded-full text-[9px] font-bold transition-colors ${
                        i < saturdayCount
                          ? i + 1 >= MIN_SATURDAY_MONTHLY
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-black"
                          : "bg-gray-700 text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Evenings Off</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${meetsEvening ? "text-green-400" : "text-red-400"}`}>
                    {eveningOff}/{MAX_EVENING_OFF} max
                  </span>
                  <span className="text-xs">{meetsEvening ? "✓" : "✗"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {DAYS.map((day) => (
              <div key={day} className="text-center rounded-lg border border-white/[0.08] bg-white/[0.02] p-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase mb-2 tracking-wider">
                  {day}
                </h4>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-400 mb-1">
                  {SLOTS.map((s) => (
                    <span key={s} className="w-full text-center bg-[#f6e05e] text-[#1a202c] rounded-sm py-0.5 font-bold border border-[#2d3748]">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {SLOTS.map((slot) => {
                    const key = `${day}-${slot}`;
                    const active = !!grid[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSlot(day, slot)}
                        className={`w-full h-8 rounded-md text-xs font-bold transition-all ${
                          active
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                            : "bg-[#2a2a2a] text-red-400 border border-white/[0.06]"
                        }`}
                      >
                        {active ? "✓" : "✗"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-4">
          <button
            onClick={() => setShowPreview((prev) => !prev)}
            className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
              showPreview ? "bg-green-600 hover:bg-green-700" : "bg-[#2a5f98] hover:bg-[#214b78]"
            } text-white`}
          >
            {showPreview ? "Hide schedule preview" : "Click to see preview of your schedule"}
          </button>
        </div>

        {showPreview && (
          <div className="px-6 pb-6">
            <div
              ref={exportRef}
              className="rounded-2xl overflow-hidden border-[3px] border-[#2d3748] bg-[#f7fafc] text-black shadow-xl"
              style={{ fontFamily: "Arial, Helvetica, sans-serif", letterSpacing: "0.01em", wordSpacing: "0.08em" }}
            >
              <div className="bg-gradient-to-br from-[#dbeafe] to-[#e2e8f0] px-6 py-8 border-b-2 border-[#2d3748]">
                <div className="text-center mb-2">
                  <div className="text-3xl font-black tracking-[0.2em] text-[#2563eb]">EZ BATHS</div>
                  <div className="text-[11px] text-[#4a5568] tracking-[0.2em] uppercase">Transform Your Bathroom Experience</div>
                  <h2 className="text-base tracking-[0.12em] mt-2 font-semibold text-[#1a202c]">CONSULTANT WEEKLY SCHEDULER</h2>
                </div>
              </div>

              <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2 mb-5">
                {DAYS.map((day) => (
                  <div key={`out-${day}`} className="bg-white border-2 border-[#cbd5e0] rounded-lg p-2 text-center min-w-0">
                    <h4 className="bg-[#4a5568] text-white text-[11px] rounded-md py-1 mb-2 font-semibold tracking-wide">
                      {day.slice(0, 3)}
                    </h4>
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      {SLOTS.map((s) => (
                        <span
                          key={`lab-${day}-${s}`}
                          className="bg-[#f6e05e] border-2 border-[#2d3748] text-[10px] px-1 py-0.5 rounded-sm font-bold text-[#1a202c] w-full text-center"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {SLOTS.map((slot) => {
                        const on = !!grid[`${day}-${slot}`];
                        return (
                          <div
                            key={`box-${day}-${slot}`}
                            className={`w-full h-7 border-2 rounded-sm flex items-center justify-center text-sm font-black ${
                              on ? "border-[#38a169] text-[#38a169] bg-[#f0fff4]" : "border-[#cbd5e0] text-[#e53e3e] bg-white"
                            }`}
                          >
                            {on ? "✓" : "✕"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white border-[3px] border-[#4a5568] p-4 rounded-lg">
                  <h3 className="font-bold text-base mb-2">Weekly&nbsp;Requirements</h3>
                  <ul className="text-sm space-y-1">
                    <li>✓ 15 of 21 Slots Open - Weekly Minimum</li>
                    <li>✓ 6 Saturday Slots Open - Monthly Minimum</li>
                    <li>✓ 3 Night Slots Off - Weekly Maximum</li>
                    <li>✓ 2.5 Hour Drive - Territory Max One Way</li>
                  </ul>
                </div>
                <div className="bg-[#ebf8ff] border-[3px] border-[#3182ce] p-4 text-center rounded-lg">
                  <h3 className="font-bold text-sm mb-2 text-[#2c5282]">SATURDAY&nbsp;SLOTS&nbsp;OPENED&nbsp;MONTH&nbsp;TO&nbsp;DATE</h3>
                  <div className="grid grid-cols-5 gap-1 max-w-[180px] mx-auto">
                    {Array.from({ length: 15 }, (_, i) => (
                      <div
                        key={`sat-preview-${i + 1}`}
                        className={`w-7 h-7 rounded-full border-2 border-[#2196F3] flex items-center justify-center text-xs font-bold ${
                          i + 1 <= saturdayCount ? "bg-[#2196F3] text-white" : "bg-white text-[#2196F3]"
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs mt-2 text-[#0d47a1]">/ 6 minimum required</div>
                </div>
              </div>

              <div className="border-2 border-[#3182ce] rounded-lg p-3 bg-white">
                <div className="text-sm"><strong>30 Day+ Vacation&nbsp;Notice:&nbsp;</strong>{vacationDisplay}</div>
                <div className="text-sm"><strong>Week&nbsp;Schedule:&nbsp;</strong>{weekRangeCompact}</div>
                <div className="text-sm"><strong>Consultant&nbsp;Name:&nbsp;</strong>{name || "________________"}</div>
                <div className="text-xs text-[#856404] mt-2 bg-[#fff3cd] border border-[#ffc107] rounded px-2 py-1">
                  Marks the blocks that{" "}{name || "[Consultant Name]"}{" "}requests OFF next week
                </div>
              </div>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => {
              localStorage.setItem(
                "scheduler_data",
                JSON.stringify({ name, weekStart, grid, saturdayCount, vacation, vacStart, vacEnd })
              );
              alert("Schedule saved!");
            }}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors w-full sm:w-auto"
          >
            💾 Save Schedule
          </button>
          <button
            onClick={saveScheduleImage}
            disabled={busyAction !== null}
            className="px-6 py-3 rounded-xl bg-[#2d7a3f] hover:bg-[#246634] disabled:opacity-60 text-white text-sm font-semibold transition-colors w-full sm:w-auto"
          >
            {busyAction === "save" ? "Capturing..." : "Save to Phone"}
          </button>
          <button
            onClick={shareScheduleImage}
            disabled={busyAction !== null}
            className="px-6 py-3 rounded-xl bg-[#355f9d] hover:bg-[#294a7a] disabled:opacity-60 text-white text-sm font-semibold transition-colors w-full sm:w-auto"
          >
            {busyAction === "share" ? "Preparing..." : "Share Schedule"}
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-xl bg-[#5b4aa0] hover:bg-[#4a3d84] text-white text-sm font-semibold transition-colors w-full sm:w-auto"
          >
            Print Schedule
          </button>
          <button
            onClick={() => {
              setGrid({});
              setSaturdayCount(6);
            }}
            className="px-6 py-3 rounded-xl bg-[#333] hover:bg-[#444] text-gray-300 text-sm font-semibold transition-colors w-full sm:w-auto"
          >
            🔄 Reset
          </button>
        </div>

        <div className="px-6 pb-6">
          <PageFooter />
        </div>
      </div>
    </div>
  );
}
