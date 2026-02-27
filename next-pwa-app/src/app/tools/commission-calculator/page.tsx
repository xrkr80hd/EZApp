"use client";

import { useState } from "react";
import { Navbar, PageFooter, PageHeader } from "@/components/ui";

const DEALER_PACK = 1500;
const COMMISSION_RATE = 10;
const MAX_AP_PAYOUT_TO_REP = 1000;

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export default function CommissionCalculatorPage() {
  const [contractPrice, setContractPrice] = useState("");
  const [abovePar, setAbovePar] = useState("");
  const [dealerPack, setDealerPack] = useState(String(DEALER_PACK));
  const [cashCardDeal, setCashCardDeal] = useState(false);
  const [secondBathDeal, setSecondBathDeal] = useState(false);
  const [turnoverRehashAmount, setTurnoverRehashAmount] = useState("");
  const [turnoverRehashNote, setTurnoverRehashNote] = useState("");
  const [extraReduction, setExtraReduction] = useState("");
  const [extraReductionReason, setExtraReductionReason] = useState("");
  const [commissionDeduction, setCommissionDeduction] = useState("");
  const [commissionDeductionReason, setCommissionDeductionReason] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [financeCompany, setFinanceCompany] = useState("");
  const [deposit, setDeposit] = useState("");
  const [dueAtInstall, setDueAtInstall] = useState("");
  const [notes, setNotes] = useState("");

  const contract = toNumber(contractPrice);
  const ap = Math.max(0, toNumber(abovePar));
  const pack = Math.max(0, toNumber(dealerPack));
  const parPrice = contract - ap;
  const rawItemSum = parPrice - pack;

  const autoReduction = (cashCardDeal ? 1000 : 0) + (secondBathDeal ? 500 : 0);
  const turnoverRehash = Math.max(0, toNumber(turnoverRehashAmount));
  const manualReduction = Math.max(0, toNumber(extraReduction));
  const totalReduction = autoReduction + manualReduction;
  const itemSumUsed = rawItemSum - totalReduction;

  const rawCommission = Math.max(0, rawItemSum) * (COMMISSION_RATE / 100);
  const adjustedCommission = Math.max(0, itemSumUsed) * (COMMISSION_RATE / 100);
  const commissionDeductionAmount = Math.max(0, toNumber(commissionDeduction));
  const netCommission = Math.max(0, adjustedCommission - commissionDeductionAmount);

  const repApShare = Math.min(ap / 2, MAX_AP_PAYOUT_TO_REP);
  const companyApShare = Math.max(0, ap - repApShare);
  const repTotal = netCommission + repApShare;

  const depositAmount = Math.max(0, toNumber(deposit));
  const dueInstallAmount =
    dueAtInstall.trim() !== "" ? Math.max(0, toNumber(dueAtInstall)) : Math.max(0, contract - depositAmount);

  const extraNeedsReason = manualReduction > 0 && !extraReductionReason.trim();
  const commissionNeedsReason = commissionDeductionAmount > 0 && !commissionDeductionReason.trim();
  const turnoverNeedsNote = turnoverRehash > 0 && !turnoverRehashNote.trim();

  return (
    <>
      <Navbar title="Commission Calculator" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[1100px] mx-auto px-5 pt-20 pb-10 space-y-5">
        <PageHeader title="Commission Calculator" subtitle="Site style + your workflow math" />

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-gray-300">
          Workflow: Contract Price {"->"} minus AP = Par Price {"->"} minus Dealer Pack = Item Sum {"->"} 10% = Raw Commission.
          Cash/2nd bath boxes reduce item sum for adjusted commission. Turnover/Rehash is informational only and does not reduce commission.
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white">Deal Inputs</h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Contract Price" value={contractPrice} onChange={setContractPrice} />
              <Field label="Above Par (AP)" value={abovePar} onChange={setAbovePar} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Dealer Pack" value={dealerPack} onChange={setDealerPack} />
              <Field label="Extra Reduction (optional)" value={extraReduction} onChange={setExtraReduction} />
            </div>

            <TextField
              label="Reason for Extra Reduction (required if amount > 0)"
              value={extraReductionReason}
              onChange={setExtraReductionReason}
              error={extraNeedsReason}
            />

            <div>
              <p className="text-xs text-gray-300 mb-2">Deal Flags (can select both)</p>
              <div className="grid sm:grid-cols-2 gap-2">
                <Toggle
                  label="Cash/Card (-1000)"
                  active={cashCardDeal}
                  onClick={() => setCashCardDeal((v) => !v)}
                />
                <Toggle
                  label="2nd Bath (-500)"
                  active={secondBathDeal}
                  onClick={() => setSecondBathDeal((v) => !v)}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field
                label="Turnover/Rehash Amount (info only)"
                value={turnoverRehashAmount}
                onChange={setTurnoverRehashAmount}
              />
              <TextField
                label="Turnover/Rehash Note (required if amount > 0)"
                value={turnoverRehashNote}
                onChange={setTurnoverRehashNote}
                error={turnoverNeedsNote}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Commission Deduction ($)" value={commissionDeduction} onChange={setCommissionDeduction} />
              <Field label="Deposit" value={deposit} onChange={setDeposit} />
            </div>

            <TextField
              label="Reason for Commission Deduction (required if amount > 0)"
              value={commissionDeductionReason}
              onChange={setCommissionDeductionReason}
              error={commissionNeedsReason}
            />

            <div className="grid sm:grid-cols-2 gap-3">
              <TextField label="Lead Source" value={leadSource} onChange={setLeadSource} />
              <TextField label="Finance Company" value={financeCompany} onChange={setFinanceCompany} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Due At Install" value={dueAtInstall} onChange={setDueAtInstall} placeholder={dueInstallAmount.toFixed(2)} />
              <TextField label="Notes" value={notes} onChange={setNotes} />
            </div>

            {(extraNeedsReason || commissionNeedsReason || turnoverNeedsNote) && (
              <p className="text-xs text-red-300">
                Add required reason/note fields before finalizing this sheet.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Calculated Results</h3>

            <Metric label="Par Price (Contract - AP)" value={money(parPrice)} />
            <Metric label="Item Sum Before Reductions" value={money(rawItemSum)} />
            <Metric label="Raw Commission (10%)" value={money(rawCommission)} />
            <Metric label="Cash/Card + 2nd Bath Reduction" value={`-${money(autoReduction)}`} />
            <Metric label="Manual Reduction" value={`-${money(manualReduction)}`} />
            <Metric label="Item Sum Used" value={money(itemSumUsed)} />
            <Metric label="Adjusted Commission (10%)" value={money(adjustedCommission)} />
            <Metric label="Commission Deduction" value={`-${money(commissionDeductionAmount)}`} />
            <Metric label="Turnover/Rehash (info only)" value={money(turnoverRehash)} />
            <Metric label="Net Commission" value={money(netCommission)} strong />
            <Metric label="AP to Rep (50/50 cap)" value={money(repApShare)} />
            <Metric label="AP to Company" value={money(companyApShare)} />

            <div className="rounded-lg bg-brand-600/20 border border-brand-500/40 px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-white font-semibold">Rep Total</span>
              <span className="text-xl font-bold text-brand-300">{money(repTotal)}</span>
            </div>

            {ap / 2 > MAX_AP_PAYOUT_TO_REP && (
              <p className="text-xs text-yellow-300">
                AP cap reached. Rep AP share is limited to {money(MAX_AP_PAYOUT_TO_REP)}.
              </p>
            )}
          </section>
        </div>

        <PageFooter />
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-300 mb-1">{label}</span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-white/[0.12] bg-black/20 px-2 py-2 text-sm text-gray-100"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  error = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-300 mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-md border px-2 py-2 text-sm text-gray-100 ${
          error ? "border-red-400 bg-red-950/20" : "border-white/[0.12] bg-black/20"
        }`}
      />
    </label>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2 py-2 text-xs ${
        active ? "border-brand-500/60 bg-brand-500/20 text-white" : "border-white/[0.15] text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 border-b border-white/[0.05] last:border-0">
      <span className={`text-sm ${strong ? "text-white font-semibold" : "text-gray-400"}`}>{label}</span>
      <span className={`${strong ? "text-lg text-green-300 font-bold" : "text-sm text-white"}`}>{value}</span>
    </div>
  );
}
