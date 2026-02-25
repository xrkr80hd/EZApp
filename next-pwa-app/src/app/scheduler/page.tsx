"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function SchedulerPage() {
  const [name, setName] = useState("");
  const [weekStart, setWeekStart] = useState(getNextMonday);
  const [grid, setGrid] = useState<Grid>({});
  const [saturdayCount, setSaturdayCount] = useState(6);
  const [vacation, setVacation] = useState(false);
  const [vacStart, setVacStart] = useState("");
  const [vacEnd, setVacEnd] = useState("");

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

  return (
    <div className="min-h-screen px-4 py-5">
      <div className="max-w-[1100px] mx-auto bg-[#1e1e1e]/[0.98] rounded-2xl overflow-hidden shadow-2xl">
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
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">🏖️ Need a vacation?</span>
              <button
                onClick={() => setVacation(!vacation)}
                title={vacation ? "Disable vacation" : "Enable vacation"}
                aria-label={vacation ? "Disable vacation" : "Enable vacation"}
                className={`w-12 h-6 rounded-full transition-colors ${vacation ? "bg-brand-500" : "bg-gray-600"} relative`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${vacation ? "translate-x-6" : "translate-x-0.5"}`}
                />
              </button>
            </div>
            {vacation && (
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
            )}
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
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center">
                <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
                  {day.slice(0, 3)}
                </h4>
                <div className="flex justify-center gap-1 text-[9px] text-gray-600 mb-1">
                  {SLOTS.map((s) => (
                    <span key={s} className="w-8">{s}</span>
                  ))}
                </div>
                <div className="flex justify-center gap-1">
                  {SLOTS.map((slot) => {
                    const key = `${day}-${slot}`;
                    const active = !!grid[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSlot(day, slot)}
                        className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${
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

        {/* Actions */}
        <div className="px-6 pb-8 flex gap-3 justify-center">
          <button
            onClick={() => {
              localStorage.setItem(
                "scheduler_data",
                JSON.stringify({ name, weekStart, grid, saturdayCount, vacation, vacStart, vacEnd })
              );
              alert("Schedule saved!");
            }}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            💾 Save Schedule
          </button>
          <button
            onClick={() => {
              setGrid({});
              setSaturdayCount(6);
            }}
            className="px-6 py-3 rounded-xl bg-[#333] hover:bg-[#444] text-gray-300 text-sm font-semibold transition-colors"
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
