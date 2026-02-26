"use client";

import { useEffect, useState } from "react";
import { Navbar, PageHeader, SectionHeader, ToolCard, PageFooter } from "@/components/ui";
import { buildCustomerExport, getCurrentCustomerId } from "@/lib/customer-files";

export default function ToolsPage() {
  const [customerName, setCustomerName] = useState("Consultant Tools");

  useEffect(() => {
    const name = getCurrentCustomerId();
    if (name) setCustomerName(name);
  }, []);

  return (
    <>
      <Navbar
        title="Tools"
        actions={[
          { label: "Change Customer", href: "/customers" },
          { label: "Home", href: "/" },
        ]}
      />

      <div className="max-w-[900px] mx-auto px-5 pt-20 pb-10">
        <PageHeader title={customerName} subtitle="Select a tool to continue" />

        {/* Customer Workflow */}
        <SectionHeader>Customer Workflow</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ToolCard
            href="/tools/customer-survey"
            icon="/icons/customer_survey.svg"
            iconType="svg"
            title="Customer Survey"
            description="Complete customer questionnaire"
          />
          <ToolCard
            href="/tools/photo-checklist"
            icon="/icons/photo_chklist.svg"
            iconType="svg"
            title="Photo Checklist"
            description="Capture job site photos"
          />
          <ToolCard
            href="/tools/whodat-video"
            icon="/icons/who_dat_vid.svg"
            iconType="svg"
            title="Who Dat Video"
            description="Upload customer video"
          />
          <ToolCard
            href="/tools/4-square"
            icon="🎯"
            title="4-Square Presentation"
            description="Build rapport and close"
          />
        </div>

        {/* Utilities & References */}
        <SectionHeader>Utilities &amp; References</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ToolCard
            href="/tools/commission-calculator"
            icon="/icons/commision_calc.svg"
            iconType="svg"
            title="Commission Calculator"
            description="Calculate your earnings"
          />
          <ToolCard
            href="/tools/tip-sheet"
            icon="📝"
            title="Tip Sheet"
            description="Quick reference guide"
          />
          <ToolCard
            href="/tools/bathroom-measurement"
            icon="📐"
            title="Bathroom Measurement"
            description="Measurement calculator"
          />
          <ToolCard
            href="/tools/vanity-form"
            icon="🧱"
            title="Vanity Form"
            description="Onyx lavatory order form"
          />
          <ToolCard
            href="https://designstudio.bathplanet.com/"
            icon="/icons/goto_bathplanet.svg"
            iconType="svg"
            title="Design Studio"
            description="Bath Planet design tools"
            external
          />
        </div>

        {/* Post Appointment */}
        <SectionHeader>Post Appointment</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ToolCard
            href="/tools/post-appointment"
            icon="📋"
            title="Post Appointment Docs"
            description="Complete sale or no-sale forms"
          />
          <ToolCard
            href="/tools/post-sale-checklist"
            icon="✅"
            title="Post Sale Checklist"
            description="Verify all steps completed"
          />
          <ToolCard
            href="/tools/post-sale-documents"
            icon="📄"
            title="Post Sale Documents"
            description="Upload signed documents"
          />
          <ToolCard
            icon="📦"
            title="Export All Data"
            description="Download customer file"
            onClick={() => {
              const name = getCurrentCustomerId();
              if (!name) {
                alert("No customer data to export");
                return;
              }
              const data = buildCustomerExport(name);
              if (!data) {
                alert("No customer data to export");
                return;
              }
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${name}_EZApp_Export.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          />
        </div>

        <PageFooter />
      </div>
    </>
  );
}
