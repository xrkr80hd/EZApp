"use client";

import { useEffect, useState } from "react";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

const QUESTIONS = [
  "How did you hear about us?",
  "How long have you lived in your current home?",
  "Have you remodeled any other rooms in your home?",
  "What prompted you to consider a bathroom remodel now?",
  "What do you like LEAST about your current bathroom?",
  "What do you like MOST about your current bathroom?",
  "Who will be using this bathroom?",
  "Are there any mobility or accessibility concerns?",
  "What style/look are you hoping to achieve?",
  "Have you looked at any other companies for this project?",
  "What's your ideal timeline for getting the project done?",
  "Is there a budget range you've set aside for this project?",
  "Are you the sole decision maker, or is anyone else involved?",
  "What would make this the perfect bathroom for you?",
  "Is there anything else you'd like us to know?",
];

export default function CustomerSurveyPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [customerName, setCustomerName] = useState("Customer");

  const mapAnswersToLegacySurvey = (name: string, source: Record<number, string>) => {
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
      takeawayNotes: get(14),
      easyClean: "",
      warranty: "",
      americanMade: "",
      bathrooms: [],
      inspirationPhotos: [],
      source: "survey-lite",
      timestamp: new Date().toISOString(),
    };
  };

  const saveSurveyWithWireup = () => {
    const name = localStorage.getItem("currentCustomer") || customerName;
    if (!name) return;

    localStorage.setItem(`survey_${name}`, JSON.stringify(answers));

    const legacySurvey = mapAnswersToLegacySurvey(name, answers);
    localStorage.setItem(`surveyStructured_${name}`, JSON.stringify(legacySurvey));

    const ezRaw = localStorage.getItem("EZAPP_current");
    try {
      const ez = ezRaw ? (JSON.parse(ezRaw) as Record<string, unknown>) : {};
      ez.survey = legacySurvey;
      localStorage.setItem("EZAPP_current", JSON.stringify(ez));
    } catch {
      localStorage.setItem("EZAPP_current", JSON.stringify({ survey: legacySurvey }));
    }
  };

  useEffect(() => {
    const name = localStorage.getItem("currentCustomer");
    if (name) {
      setCustomerName(name);
      const saved = localStorage.getItem(`survey_${name}`);
      if (saved) {
        try { setAnswers(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
  }, []);

  // Auto-save
  useEffect(() => {
    const name = localStorage.getItem("currentCustomer");
    if (!name) return;
    const timer = setInterval(() => {
      saveSurveyWithWireup();
    }, 30000);
    return () => clearInterval(timer);
  }, [answers]);

  const completed = Object.values(answers).filter((a) => a.trim().length > 0).length;

  return (
    <>
      <Navbar title="Customer Survey" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[700px] mx-auto px-5 pt-20 pb-10">
        <PageHeader
          title={`${customerName} — Survey`}
          subtitle={`${completed}/${QUESTIONS.length} questions answered`}
        />

        <div className="space-y-4">
          {QUESTIONS.map((q, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.03]">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="text-gray-600 mr-2">{i + 1}.</span>
                {q}
              </label>
              <textarea
                value={answers[i] || ""}
                onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                rows={2}
                placeholder="Enter response..."
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 resize-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              saveSurveyWithWireup();
              alert("Survey saved and wired to 4-Square.");
            }}
            className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            💾 Save Survey
          </button>
        </div>

        <PageFooter />
      </div>
    </>
  );
}
