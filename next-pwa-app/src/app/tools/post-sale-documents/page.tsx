"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

interface DocCard {
  title: string;
  description: string;
  href: string;
  storagePrefix: string;
}

const DOCUMENTS: DocCard[] = [
  {
    title: "Bathroom Measurements",
    description: "Complete measurement form with diagram",
    href: "/tools/bathroom-measurement",
    storagePrefix: "measurements_",
  },
  {
    title: "JOC – Job Order Checklist",
    description: "Product specs, accessories & plumbing (combined form)",
    href: "/tools/customer-survey",
    storagePrefix: "survey_",
  },
  {
    title: "Post Sale Checklist",
    description: "Dropbox & One Click upload tracking",
    href: "/tools/post-sale-checklist",
    storagePrefix: "postSaleChecklist_",
  },
  {
    title: "Commission Calculator",
    description: "Calculate your earnings",
    href: "/tools/commission-calculator",
    storagePrefix: "commission_",
  },
];

export default function PostSaleDocumentsPage() {
  const [customer, setCustomer] = useState("—");
  const [completedDocs, setCompletedDocs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const name = localStorage.getItem("currentCustomer") || "—";
    setCustomer(name);

    const done = new Set<string>();
    DOCUMENTS.forEach((doc) => {
      if (localStorage.getItem(`${doc.storagePrefix}${name}`)) {
        done.add(doc.storagePrefix);
      }
    });
    setCompletedDocs(done);
  }, []);

  const saleDate = new Date().toLocaleDateString();

  return (
    <>
      <Navbar title="Post-Sale Documents" actions={[{ label: "Tools", href: "/tools" }]} />

      <div className="max-w-[800px] mx-auto px-5 pt-20 pb-10">
        {/* Header */}
        <div className="rounded-2xl overflow-hidden border border-white/[0.06] mb-6">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-7 text-center">
            <h1 className="text-2xl font-bold text-white mb-1">🛁 Post Sale Documents</h1>
            <p className="text-sm text-brand-200">Congratulations on the sale! Complete these documents:</p>
          </div>

          <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-t border-white/[0.06]">
            <h3 className="text-white text-sm">
              Customer: <span className="text-brand-400 font-bold">{customer}</span>
            </h3>
            <p className="text-gray-500 text-xs">Sale Date: {saleDate}</p>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {DOCUMENTS.map((doc) => {
            const done = completedDocs.has(doc.storagePrefix);
            return (
              <Link
                key={doc.storagePrefix}
                href={doc.href}
                className={`group block p-5 rounded-xl border-2 transition-all hover:-translate-y-1 hover:shadow-lg ${
                  done
                    ? "border-brand-600/40 bg-brand-600/5"
                    : "border-white/[0.06] bg-white/[0.03] hover:border-brand-500/30"
                }`}
              >
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-brand-300 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{doc.description}</p>
                <span
                  className={`inline-block text-[11px] font-semibold px-3 py-1 rounded-full uppercase ${
                    done ? "bg-brand-600/20 text-brand-300" : "bg-white/[0.06] text-gray-400"
                  }`}
                >
                  {done ? "✓ Completed" : "Start Form →"}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Back */}
        <div className="text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-semibold transition-colors"
          >
            ← Back to Tools
          </Link>
        </div>

        <PageFooter />
      </div>
    </>
  );
}
