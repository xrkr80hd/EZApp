"use client";

import { useEffect, useState } from "react";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

const QUADRANTS = [
  { title: "Their Story", prompt: "What brought them to this point? Family, lifestyle, frustrations..." },
  { title: "Our Story", prompt: "Company history, values, what makes us different..." },
  { title: "The Product", prompt: "Features, benefits, quality, warranty, timeline..." },
  { title: "The Investment", prompt: "Pricing, financing options, value proposition..." },
];

export default function FourSquarePage() {
  const [customerName, setCustomerName] = useState("Customer");
  const [notes, setNotes] = useState<Record<number, string>>({});

  const mapLiteSurveyToLegacy = (name: string, source: Record<number, string>) => {
    const get = (i: number) => (source[i] || "").trim();
    const mobilityRaw = get(7).toLowerCase();
    const mobilityIssue =
      mobilityRaw.includes("yes") || mobilityRaw.includes("y") || mobilityRaw.includes("wheel") ? "Yes" : "";
    return {
      customerName: name,
      q1: get(0),
      q2: [get(8), get(6)].filter(Boolean).join(" | "),
      bathroomType: get(8),
      mobilityIssue,
      q6notes: get(7),
      q7: get(10),
      q8: get(12),
      q9: get(3),
      targetProject: get(3),
      q10notes: get(11),
      q12: get(13) || get(5),
      q13: get(4),
      productType: get(8),
      easyClean: "",
      warranty: "",
      americanMade: "",
      bathrooms: [],
      inspirationPhotos: [],
    };
  };

  const loadSurveyData = (name: string) => {
    const ezRaw = localStorage.getItem("EZAPP_current");
    if (ezRaw) {
      try {
        const ez = JSON.parse(ezRaw) as { survey?: Record<string, unknown> };
        if (ez.survey && typeof ez.survey === "object") return ez.survey as Record<string, unknown>;
      } catch {
        // ignore parse failures
      }
    }

    const structured = localStorage.getItem(`surveyStructured_${name}`);
    if (structured) {
      try {
        return JSON.parse(structured) as Record<string, unknown>;
      } catch {
        // ignore parse failures
      }
    }

    const rawSurvey = localStorage.getItem(`survey_${name}`);
    if (rawSurvey) {
      try {
        const lite = JSON.parse(rawSurvey) as Record<number, string>;
        return mapLiteSurveyToLegacy(name, lite) as unknown as Record<string, unknown>;
      } catch {
        // ignore parse failures
      }
    }
    return null;
  };

  const populateFromSurvey = () => {
    const name = localStorage.getItem("currentCustomer") || customerName;
    const survey = loadSurveyData(name);
    if (!survey) {
      alert("No survey data found. Save Customer Survey first.");
      return;
    }

    const photosRaw = localStorage.getItem(`photos_${name}`);
    let photoCount = 0;
    if (photosRaw) {
      try {
        const photos = JSON.parse(photosRaw) as Array<{ dataUrl?: string | null }>;
        photoCount = photos.filter((p) => !!p.dataUrl).length;
      } catch {
        photoCount = 0;
      }
    }

    const storyLines: string[] = [];
    if (typeof survey.productType === "string" && survey.productType) storyLines.push(`Product Type: ${survey.productType}`);
    if (typeof survey.q2 === "string" && survey.q2) storyLines.push(`Project Details: ${survey.q2}`);
    if (typeof survey.bathroomType === "string" && survey.bathroomType) storyLines.push(`Bathroom: ${survey.bathroomType}`);
    if (typeof survey.mobilityIssue === "string" && survey.mobilityIssue === "Yes") {
      storyLines.push(`Mobility Issue: ${(survey.q6notes as string) || "Yes"}`);
    }
    if (typeof survey.easyClean === "string" && survey.easyClean === "Yes") storyLines.push("Must Have: Easy to clean surfaces");
    if (typeof survey.q12 === "string" && survey.q12) storyLines.push(`Priorities: ${survey.q12}`);
    if (photoCount > 0) storyLines.push(`Inspection Photos Uploaded: ${photoCount}`);

    const productLines: string[] = [];
    if (typeof survey.q1 === "string" && survey.q1) productLines.push(`Referral Source: ${survey.q1}`);
    if (typeof survey.q12 === "string" && survey.q12) productLines.push(`What Matters to Them: ${survey.q12}`);
    if (typeof survey.q13 === "string" && survey.q13) productLines.push(`What They DON'T Want: ${survey.q13}`);
    if (typeof survey.warranty === "string" && survey.warranty === "Yes") productLines.push("Show warranty segment");
    if (typeof survey.americanMade === "string" && survey.americanMade === "Yes") productLines.push("Show USA manufacturing segment");
    if (typeof survey.mobilityIssue === "string" && survey.mobilityIssue === "Yes") productLines.push("Show safety features segment");

    const investmentLines: string[] = [];
    if (typeof survey.bathroomType === "string" && survey.bathroomType) investmentLines.push(`Bathroom Type: ${survey.bathroomType}`);
    if (typeof survey.q7 === "string" && survey.q7) investmentLines.push(`Timeline: ${survey.q7}`);
    if (typeof survey.q8 === "string" && survey.q8) investmentLines.push(`Who's More Interested: ${survey.q8}`);
    if (typeof survey.q9 === "string" && survey.q9) investmentLines.push(`Whose Idea: ${survey.q9}`);
    if (typeof survey.targetProject === "string" && survey.targetProject) investmentLines.push(`Target Project: ${survey.targetProject}`);
    if (typeof survey.q10notes === "string" && survey.q10notes) investmentLines.push(`Budget/Timeline Notes: ${survey.q10notes}`);

    setNotes((prev) => ({
      ...prev,
      0: storyLines.join("\n"),
      2: productLines.join("\n"),
      3: investmentLines.join("\n"),
    }));
  };

  useEffect(() => {
    const name = localStorage.getItem("currentCustomer");
    if (name) {
      setCustomerName(name);
      const saved = localStorage.getItem(`foursquare_${name}`);
      if (saved) {
        try { setNotes(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
  }, []);

  return (
    <>
      <Navbar title="4-Square" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[800px] mx-auto px-5 pt-20 pb-10">
        <PageHeader title={`${customerName} — 4-Square`} subtitle="Build rapport and close" />

        <div className="mb-4">
          <button
            onClick={populateFromSurvey}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            Populate from Survey
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUADRANTS.map((q, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.03]">
              <h3 className="text-sm font-bold text-white mb-1">🎯 {q.title}</h3>
              <p className="text-xs text-gray-600 mb-3">{q.prompt}</p>
              <textarea
                rows={5}
                value={notes[i] || ""}
                onChange={(e) => setNotes({ ...notes, [i]: e.target.value })}
                placeholder="Notes..."
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 resize-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => {
              const name = localStorage.getItem("currentCustomer");
              if (name) {
                localStorage.setItem(`foursquare_${name}`, JSON.stringify(notes));
                alert("4-Square saved!");
              }
            }}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            💾 Save
          </button>
        </div>

        <PageFooter />
      </div>
    </>
  );
}
