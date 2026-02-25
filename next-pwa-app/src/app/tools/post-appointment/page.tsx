"use client";

import { useRouter } from "next/navigation";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

export default function PostAppointmentPage() {
  const router = useRouter();
  const customer =
    typeof window !== "undefined"
      ? localStorage.getItem("currentCustomer") || "—"
      : "—";

  function handleChoice(sale: boolean) {
    if (typeof window !== "undefined") {
      localStorage.setItem("saleStatus", sale ? "sold" : "no-sale");
    }
    router.push(sale ? "/tools/post-sale-documents" : "/tools/tip-sheet");
  }

  return (
    <>
      <Navbar title="Post Appointment" actions={[{ label: "Tools", href: "/tools" }]} />

      <div className="flex items-center justify-center min-h-screen px-5">
        <div className="max-w-[460px] w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl p-10 text-center animate-slide-up">
          <PageHeader title="Post Appointment" subtitle={`Customer: ${customer}`} />

          <p className="text-2xl font-semibold text-white mb-10">
            Did you make a sale?
          </p>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <button
              onClick={() => handleChoice(true)}
              className="py-6 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white text-lg font-bold shadow-lg hover:shadow-emerald-500/30 active:scale-95 transition-all"
            >
              ✅ Yes, I Made a Sale!
            </button>

            <button
              onClick={() => handleChoice(false)}
              className="py-6 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 text-white text-lg font-bold shadow-lg hover:shadow-red-400/30 active:scale-95 transition-all"
            >
              ❌ No Sale Today
            </button>
          </div>

          <PageFooter />
        </div>
      </div>
    </>
  );
}
