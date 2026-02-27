"use client";

import { useEffect, useState } from "react";
import { Navbar, PageFooter, PageHeader } from "@/components/ui";

type SurveyLike = Record<string, unknown>;

function asText(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function hasAccessibility(survey: SurveyLike) {
  const raw = asText(survey.q11_accessibility).toLowerCase();
  return !!raw && raw !== "no" && raw !== "none";
}

function loadSurvey(name: string): SurveyLike | null {
  const ezRaw = localStorage.getItem("EZAPP_current");
  if (ezRaw) {
    try {
      const ez = JSON.parse(ezRaw) as { survey?: SurveyLike };
      if (ez.survey) return ez.survey;
    } catch {
      // ignore
    }
  }

  const structured = localStorage.getItem(`surveyStructured_${name}`);
  if (structured) {
    try {
      return JSON.parse(structured) as SurveyLike;
    } catch {
      // ignore
    }
  }

  const raw = localStorage.getItem(`survey_${name}`);
  if (raw) {
    try {
      return JSON.parse(raw) as SurveyLike;
    } catch {
      // ignore
    }
  }
  return null;
}

function loadPhotoCount(name: string) {
  const raw = localStorage.getItem(`photos_${name}`);
  if (!raw) return 0;
  try {
    const photos = JSON.parse(raw) as Array<{ dataUrl?: string | null; confirmed?: boolean; data?: string | null }>;
    return photos.filter((p) => !!p.dataUrl || p.confirmed || !!p.data).length;
  } catch {
    return 0;
  }
}

function buildBox1(survey: SurveyLike, photoCount: number) {
  const lines: string[] = [];
  const baths = survey.q3_whichBaths;

  if (asText(survey.q2_numBaths)) lines.push(`Number of Bathrooms: ${asText(survey.q2_numBaths)}`);
  if (Array.isArray(baths) && baths.length) lines.push(`Bathrooms: ${baths.join(", ")}`);
  if (asText(survey.q4_primaryUsers)) lines.push(`Primary Users: ${asText(survey.q4_primaryUsers)}`);
  if (asText(survey.q5_vision)) lines.push(`Their Vision: ${asText(survey.q5_vision)}`);
  if (asText(survey.q7_likedMost)) lines.push(`What They Loved: ${asText(survey.q7_likedMost)}`);
  if (asText(survey.q9_dislikeCurrent)) lines.push(`Current Dislikes: ${asText(survey.q9_dislikeCurrent)}`);
  if (asText(survey.q10_wantChanged)) lines.push(`Needs to Change: ${asText(survey.q10_wantChanged)}`);
  if (hasAccessibility(survey)) lines.push(`Accessibility Needs: ${asText(survey.q11_accessibility)} ${asText(survey.q11_notes)}`.trim());
  if (asText(survey.q8_likeCurrent)) lines.push(`Keep in Mind: "${asText(survey.q8_likeCurrent)}"`);
  if (photoCount > 0) lines.push(`Inspection Photos Uploaded: ${photoCount}`);

  return lines.join("\n");
}

function buildBox3(survey: SurveyLike) {
  const lines: string[] = [];
  if (asText(survey.q1_hearAbout)) lines.push(`How They Heard About Us: ${asText(survey.q1_hearAbout)}`);
  if (asText(survey.q12_homeAge)) lines.push(`Home Age: ${asText(survey.q12_homeAge)}`);
  if (asText(survey.q13_yearsLived)) lines.push(`Years in Home: ${asText(survey.q13_yearsLived)}`);
  if (asText(survey.q14_yearsPlanning)) lines.push(`Planning to Stay: ${asText(survey.q14_yearsPlanning)}`);
  if (hasAccessibility(survey)) lines.push("Show safety/accessibility segment.");
  lines.push("Remember to play video segments that match their situation.");
  return lines.join("\n");
}

function buildBox4(survey: SurveyLike) {
  const lines: string[] = [];
  if (asText(survey.q15_howLongConsidering)) lines.push(`Been Considering: ${asText(survey.q15_howLongConsidering)}`);
  if (asText(survey.q16_whatPrevented)) lines.push(`What Held Them Back: ${asText(survey.q16_whatPrevented)}`);
  if (asText(survey.q17_otherProjects)) lines.push(`Competing Projects: ${asText(survey.q17_otherProjects)}`);
  if (asText(survey.q18_fundingMethod)) lines.push(`Funding Method: ${asText(survey.q18_fundingMethod)}`);
  if (asText(survey.q19_cashTiming)) lines.push(`Cash Timing: ${asText(survey.q19_cashTiming)}`);
  if (asText(survey.q20_monthlyRange)) lines.push(`Monthly Range: ${asText(survey.q20_monthlyRange)}`);
  if (asText(survey.q21_deposit)) lines.push(`Deposit Capability: ${asText(survey.q21_deposit)}`);
  lines.push("Focus: Make it work financially with payment options and value.");
  return lines.join("\n");
}

export default function FourSquarePage() {
  const [customerName, setCustomerName] = useState("Customer");
  const [box1, setBox1] = useState("");
  const [box2, setBox2] = useState("");
  const [box3, setBox3] = useState("");
  const [box4, setBox4] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("currentCustomer") || "Customer";
    setCustomerName(name);

    const last = localStorage.getItem("last_four_square");
    if (!last) return;
    try {
      const parsed = JSON.parse(last) as { customerName?: string; box1?: string; box2?: string; box3?: string; box4?: string };
      if (parsed.customerName === name) {
        setBox1(parsed.box1 || "");
        setBox2(parsed.box2 || "");
        setBox3(parsed.box3 || "");
        setBox4(parsed.box4 || "");
      }
    } catch {
      // ignore
    }
  }, []);

  const populate = () => {
    const name = localStorage.getItem("currentCustomer") || customerName;
    const survey = loadSurvey(name);
    if (!survey) {
      alert("No survey data found. Please complete the customer survey first.");
      return;
    }

    const photoCount = loadPhotoCount(name);
    setBox1(buildBox1(survey, photoCount));
    setBox3(buildBox3(survey));
    setBox4(buildBox4(survey));
    alert("4-Square populated. Review and edit as needed.");
  };

  const save = () => {
    const safe = (localStorage.getItem("currentCustomer") || customerName).replace(/[^a-zA-Z0-9]/g, "_");
    const record = {
      customerName: localStorage.getItem("currentCustomer") || customerName,
      timestamp: new Date().toISOString(),
      box1,
      box2,
      box3,
      box4,
    };

    const keys = Object.keys(localStorage).filter((k) => k.startsWith(`four_square_${safe}_`));
    keys.forEach((k) => localStorage.removeItem(k));

    localStorage.setItem(`four_square_${safe}_${Date.now()}`, JSON.stringify(record));
    localStorage.setItem("last_four_square", JSON.stringify(record));
    alert("4-Square saved.");
  };

  return (
    <>
      <Navbar title="4-Square" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[950px] mx-auto px-5 pt-20 pb-10">
        <PageHeader title={`${customerName} - 4-Square`} subtitle="Reference logic, editable outputs" />

        <button
          onClick={populate}
          className="w-full mb-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
        >
          Populate 4-Square
        </button>

        <div className="grid md:grid-cols-2 gap-3">
          <Box title="Box 1 - Love The Design" value={box1} onChange={setBox1} />
          <Box title="Box 2 - Custom Notes" value={box2} onChange={setBox2} />
          <Box title="Box 3 - Trust The Company" value={box3} onChange={setBox3} />
          <Box title="Box 4 - Make It Affordable" value={box4} onChange={setBox4} />
        </div>

        <button
          onClick={save}
          className="w-full mt-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
        >
          Save 4-Square
        </button>

        <PageFooter />
      </div>
    </>
  );
}

function Box({ title, value, onChange }: { title: string; value: string; onChange: (value: string) => void }) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <textarea
        rows={9}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-brand-500/40"
      />
    </section>
  );
}
