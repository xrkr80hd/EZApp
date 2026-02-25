import { Navbar, PageHeader, PageFooter } from "@/components/ui";

const TIPS = [
  { category: "Before the Appointment", items: [
    "Research the neighborhood and home value",
    "Review any previous notes or customer data",
    "Ensure all tools and materials are in your vehicle",
    "Arrive 5 minutes early — never late",
    "Dress professionally and wear your badge",
  ]},
  { category: "During the Appointment", items: [
    "Build rapport before talking business",
    "Ask open-ended questions — listen more than you talk",
    "Complete the full customer survey",
    "Take ALL required photos with measurements",
    "Present the 4-Square properly",
    "Show the WhoDAT video",
    "Address objections with empathy, not pressure",
  ]},
  { category: "Closing Tips", items: [
    "Summarize what they told you they wanted",
    "Present financing options clearly",
    "Create urgency without pressure",
    "Ask for the sale directly",
    "If they say no, ask what would need to change",
  ]},
  { category: "After the Appointment", items: [
    "Complete all post-appointment documents immediately",
    "Upload photos and paperwork same day",
    "Send a thank-you text/email within 1 hour",
    "Update your schedule for the week",
    "Review what went well and what to improve",
  ]},
];

export default function TipSheetPage() {
  return (
    <>
      <Navbar title="Tip Sheet" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[700px] mx-auto px-5 pt-20 pb-10">
        <PageHeader title="Consultant Tip Sheet" subtitle="Quick reference guide for appointments" />

        <div className="space-y-6">
          {TIPS.map((section, i) => (
            <div key={i}>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((tip, j) => (
                  <div
                    key={j}
                    className="flex items-start gap-3 px-4 py-3 rounded-lg border border-white/[0.04] bg-white/[0.02]"
                  >
                    <span className="text-green-500 text-sm mt-0.5">✓</span>
                    <p className="text-sm text-gray-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <PageFooter />
      </div>
    </>
  );
}
