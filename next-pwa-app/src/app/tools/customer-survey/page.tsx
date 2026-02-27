"use client";

import { useEffect, useState } from "react";
import { Navbar, PageFooter, PageHeader } from "@/components/ui";

type SurveyData = {
  customerName: string;
  productType: string;
  customerAddress: string;
  timestamp: string;
  q1_hearAbout: string;
  q2_numBaths: string;
  q3_whichBaths: string[];
  q3_other: string;
  q4_primaryUsers: string;
  q5_vision: string;
  q6_seenBath: string;
  q7_likedMost: string;
  q8_likeCurrent: string;
  q9_dislikeCurrent: string;
  q10_wantChanged: string;
  q11_accessibility: string;
  q11_notes: string;
  q12_homeAge: string;
  q13_yearsLived: string;
  q14_yearsPlanning: string;
  q15_howLongConsidering: string;
  q16_whatPrevented: string;
  q17_otherProjects: string;
  q18_fundingMethod: string;
  q19_cashTiming: string;
  q20_monthlyRange: string;
  q21_deposit: string;
  q21_notes: string;
  takeawayNotes: string;
  // Legacy aliases for old pages.
  q1: string;
  q4: string;
  q5: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q12: string;
  q13: string;
  q14: string;
  q15: string;
  q16: string;
  q17: string;
  q18_funding: string;
  q19: string;
  q20_range: string;
  q21_notes_legacy: string;
  mobilityIssue: string;
  q6notes: string;
};

const DEFAULT_SURVEY: SurveyData = {
  customerName: "",
  productType: "",
  customerAddress: "",
  timestamp: "",
  q1_hearAbout: "",
  q2_numBaths: "",
  q3_whichBaths: [],
  q3_other: "",
  q4_primaryUsers: "",
  q5_vision: "",
  q6_seenBath: "",
  q7_likedMost: "",
  q8_likeCurrent: "",
  q9_dislikeCurrent: "",
  q10_wantChanged: "",
  q11_accessibility: "",
  q11_notes: "",
  q12_homeAge: "",
  q13_yearsLived: "",
  q14_yearsPlanning: "",
  q15_howLongConsidering: "",
  q16_whatPrevented: "",
  q17_otherProjects: "",
  q18_fundingMethod: "",
  q19_cashTiming: "",
  q20_monthlyRange: "",
  q21_deposit: "",
  q21_notes: "",
  takeawayNotes: "",
  q1: "",
  q4: "",
  q5: "",
  q7: "",
  q8: "",
  q9: "",
  q10: "",
  q12: "",
  q13: "",
  q14: "",
  q15: "",
  q16: "",
  q17: "",
  q18_funding: "",
  q19: "",
  q20_range: "",
  q21_notes_legacy: "",
  mobilityIssue: "",
  q6notes: "",
};

const BATH_OPTIONS = ["Master", "Hall", "Guest", "Kids", "Basement"];

function withLegacyAliases(data: SurveyData): SurveyData {
  const next = { ...data };
  next.q1 = next.q1_hearAbout;
  next.q4 = next.q4_primaryUsers;
  next.q5 = next.q5_vision;
  next.q7 = next.q7_likedMost;
  next.q8 = next.q8_likeCurrent;
  next.q9 = next.q9_dislikeCurrent;
  next.q10 = next.q10_wantChanged;
  next.q12 = next.q12_homeAge;
  next.q13 = next.q13_yearsLived;
  next.q14 = next.q14_yearsPlanning;
  next.q15 = next.q15_howLongConsidering;
  next.q16 = next.q16_whatPrevented;
  next.q17 = next.q17_otherProjects;
  next.q18_funding = next.q18_fundingMethod;
  next.q19 = next.q19_cashTiming;
  next.q20_range = next.q20_monthlyRange;
  next.q21_notes_legacy = next.q21_notes;
  next.mobilityIssue = next.q11_accessibility;
  next.q6notes = next.q11_notes;
  return next;
}

export default function CustomerSurveyPage() {
  const [customerName, setCustomerName] = useState("Customer");
  const [form, setForm] = useState<SurveyData>(DEFAULT_SURVEY);
  const [cacheKey, setCacheKey] = useState("survey_cache_default");

  const saveSurvey = (input: SurveyData) => {
    const name = localStorage.getItem("currentCustomer") || customerName || "Customer";
    const survey = withLegacyAliases({
      ...input,
      customerName: name,
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem(`survey_${name}`, JSON.stringify(survey));
    localStorage.setItem(`surveyStructured_${name}`, JSON.stringify(survey));
    localStorage.setItem(cacheKey, JSON.stringify(survey));

    const ezRaw = localStorage.getItem("EZAPP_current");
    try {
      const ez = ezRaw ? (JSON.parse(ezRaw) as Record<string, unknown>) : {};
      ez.survey = survey;
      localStorage.setItem("EZAPP_current", JSON.stringify(ez));
    } catch {
      localStorage.setItem("EZAPP_current", JSON.stringify({ survey }));
    }
  };

  useEffect(() => {
    const name = localStorage.getItem("currentCustomer") || "Customer";
    setCustomerName(name);
    setCacheKey(`survey_cache_${name.replace(/[^a-zA-Z0-9]/g, "_")}`);

    const candidates = [
      localStorage.getItem(`surveyStructured_${name}`),
      localStorage.getItem(`survey_${name}`),
      localStorage.getItem(`survey_cache_${name.replace(/[^a-zA-Z0-9]/g, "_")}`),
    ];

    for (const raw of candidates) {
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as Partial<SurveyData>;
        setForm((prev) => withLegacyAliases({ ...prev, ...parsed } as SurveyData));
        break;
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => saveSurvey(form), 5000);
    return () => clearInterval(timer);
  }, [form, cacheKey, customerName]);

  const setField = <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => {
    setForm((prev) => withLegacyAliases({ ...prev, [key]: value } as SurveyData));
  };

  const toggleBath = (value: string) => {
    setForm((prev) => {
      const has = prev.q3_whichBaths.includes(value);
      const nextBaths = has ? prev.q3_whichBaths.filter((b) => b !== value) : [...prev.q3_whichBaths, value];
      return withLegacyAliases({ ...prev, q3_whichBaths: nextBaths });
    });
  };

  return (
    <>
      <Navbar title="Customer Survey" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[950px] mx-auto px-5 pt-20 pb-10 space-y-4">
        <PageHeader title={`${customerName} - Survey`} subtitle="Reference-compatible logic for 4-Square" />

        <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 grid md:grid-cols-2 gap-3">
          <Input label="Product Type" value={form.productType} onChange={(v) => setField("productType", v)} />
          <Input label="Customer Address" value={form.customerAddress} onChange={(v) => setField("customerAddress", v)} />
        </section>

        <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
          <Input label="1. How did you hear about us?" value={form.q1_hearAbout} onChange={(v) => setField("q1_hearAbout", v)} />
          <RadioRow label="2. How many baths are in the home?" value={form.q2_numBaths} onChange={(v) => setField("q2_numBaths", v)} options={["1", "2", "3", "4+"]} />
          <CheckRow label="3. Which bath(s) will we be remodeling?" values={form.q3_whichBaths} onToggle={toggleBath} options={BATH_OPTIONS} />
          <Input label='3b. Other bathroom(s)' value={form.q3_other} onChange={(v) => setField("q3_other", v)} />
          <Input label="4. Who will be the primary user(s) of your new bath(s)?" value={form.q4_primaryUsers} onChange={(v) => setField("q4_primaryUsers", v)} />
          <Input label="5. How do you envision your bathroom(s) when our job is finished?" value={form.q5_vision} onChange={(v) => setField("q5_vision", v)} />
          <RadioRow label="6. Have you seen a bathroom that's caught your attention?" value={form.q6_seenBath} onChange={(v) => setField("q6_seenBath", v)} options={["Yes", "No"]} />
          {form.q6_seenBath === "Yes" && (
            <Input label="7. What did you like most about it?" value={form.q7_likedMost} onChange={(v) => setField("q7_likedMost", v)} />
          )}
          <Input label="8. What do you like most about your current bath?" value={form.q8_likeCurrent} onChange={(v) => setField("q8_likeCurrent", v)} />
          <Input label="9. What do you like least about your current bath?" value={form.q9_dislikeCurrent} onChange={(v) => setField("q9_dislikeCurrent", v)} />
          <Input label="10. What would you like us to change in your current bath?" value={form.q10_wantChanged} onChange={(v) => setField("q10_wantChanged", v)} />
          <RadioRow label="11. Are you considering a walk-in tub or other accessibility options?" value={form.q11_accessibility} onChange={(v) => setField("q11_accessibility", v)} options={["Yes", "No", "Maybe"]} />
          <Input label="11b. Notes on mobility concerns, who needs it, why..." value={form.q11_notes} onChange={(v) => setField("q11_notes", v)} />
          <Input label="12. Age of home" value={form.q12_homeAge} onChange={(v) => setField("q12_homeAge", v)} />
          <Input label="13. Years you've lived here" value={form.q13_yearsLived} onChange={(v) => setField("q13_yearsLived", v)} />
          <Input label="14. Years you plan to live here" value={form.q14_yearsPlanning} onChange={(v) => setField("q14_yearsPlanning", v)} />
          <Input label="15. How long have you been considering remodeling your bathroom?" value={form.q15_howLongConsidering} onChange={(v) => setField("q15_howLongConsidering", v)} />
          <Input label="16. What's prevented you from acting on your plan before now?" value={form.q16_whatPrevented} onChange={(v) => setField("q16_whatPrevented", v)} />
          <Input label="17. What other home improvement projects have you been considering?" value={form.q17_otherProjects} onChange={(v) => setField("q17_otherProjects", v)} />
          <RadioRow label="18. How would you prefer to fund this project?" value={form.q18_fundingMethod} onChange={(v) => setField("q18_fundingMethod", v)} options={["Cash", "Monthly", "Credit Card"]} />
          {form.q18_fundingMethod === "Cash" && (
            <Input label="19. If cash, explain timing:" value={form.q19_cashTiming} onChange={(v) => setField("q19_cashTiming", v)} />
          )}
          {form.q18_fundingMethod === "Monthly" && (
            <RadioRow label="20. If monthly plan, what's a comfortable payment range?" value={form.q20_monthlyRange} onChange={(v) => setField("q20_monthlyRange", v)} options={["$150-$200", "$200-$250", "$250-$300", "$300+"]} />
          )}
          <RadioRow label="21. For a project like this, are you able to put down a small deposit?" value={form.q21_deposit} onChange={(v) => setField("q21_deposit", v)} options={["Yes", "No", "Need to discuss"]} />
          <Input label="21b. Notes about deposit, timing, amount..." value={form.q21_notes} onChange={(v) => setField("q21_notes", v)} />
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-sm text-gray-300">
            <strong>Takeaway Statement:</strong> "About 20% of the time I can't help anyone, however, if I can't help you I'll always steer you to someone who can."
          </div>
          <TextArea label="Takeaway Notes / Response:" value={form.takeawayNotes} onChange={(v) => setField("takeawayNotes", v)} />
        </section>

        <button
          onClick={() => {
            saveSurvey(form);
            alert("Survey saved with reference-compatible keys.");
          }}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
        >
          Save Survey
        </button>

        <PageFooter />
      </div>
    </>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-300 mb-1.5">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-white focus:outline-none focus:border-brand-500/40"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-300 mb-1.5">{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-white focus:outline-none focus:border-brand-500/40"
      />
    </label>
  );
}

function RadioRow({
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
      <p className="text-sm text-gray-300 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-3 py-1.5 rounded-md border text-sm ${value === option ? "bg-brand-600 border-brand-500 text-white" : "border-white/[0.15] text-gray-300"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckRow({
  label,
  values,
  onToggle,
  options,
}: {
  label: string;
  values: string[];
  onToggle: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <p className="text-sm text-gray-300 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`px-3 py-1.5 rounded-md border text-sm ${values.includes(option) ? "bg-brand-600 border-brand-500 text-white" : "border-white/[0.15] text-gray-300"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
