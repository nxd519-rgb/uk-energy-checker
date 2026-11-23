"use client";

import { useState } from "react";
import { Result, Role } from "@/lib/calc";

const gbp = (n: number) => "£" + n.toLocaleString("en-GB");
const ratingColour: Record<string, string> = {
  A: "bg-green-600", B: "bg-green-500", C: "bg-lime-500", D: "bg-yellow-500", E: "bg-orange-500", F: "bg-orange-600", G: "bg-red-600",
};

export default function RoadmapView({
  address,
  role,
  result,
  stripeLink,
  affiliateLink,
  onReset,
}: {
  address: string;
  role: Role;
  result: Result;
  stripeLink: string;
  affiliateLink: string;
  onReset: () => void;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const totalSavings = result.upgrades.reduce((s, u) => s + u.annualSaving, 0);
  const totalCo2 = result.upgrades.reduce((s, u) => s + u.co2SavedTonnes, 0).toFixed(1);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Property Retrofit &amp; Tariff Assessment</p>
          <h2 className="text-base font-semibold text-slate-900">{address}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">{role} Profile</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase text-slate-500">Current EPC</p>
          <span className={`mt-2 inline-flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold text-white ${ratingColour[result.rating]}`}>{result.rating}</span>
        </div>
        <div className="rounded-xl bg-red-50 p-4">
          <p className="text-xs uppercase text-red-700">Est. yearly overpayment</p>
          <p className="mt-2 text-2xl font-bold text-red-700">{gbp(result.overpayment)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-xs uppercase text-emerald-700">Grants available</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{gbp(result.grantTotal)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">Your EPC Certificate Profile</p>
        <p><strong>Floor Area:</strong> {result.floorArea} m² | <strong>Est. Annual Bill:</strong> {gbp(result.totalSpend)} ({gbp(result.heatingSpend)} heat / {gbp(result.electricitySpend)} elec)</p>
        <p><strong>Current Heating:</strong> {result.heatingType}</p>
        <p><strong>Wall Construction:</strong> {result.wallType}</p>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200">
        <div aria-hidden={!unlocked} className={`space-y-3 p-5 ${unlocked ? "" : "select-none blur-sm"}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900">Financial ROI &amp; Upgrade Roadmap</h3>
            <span className="text-xs font-semibold text-emerald-700">Total Potential: +{gbp(totalSavings)}/yr ({totalCo2}t CO₂/yr)</span>
          </div>
          {result.upgrades.map((u, idx) => (
            <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">{idx + 1}. {u.name}</span>
                <span className="font-bold text-emerald-700">+{gbp(u.annualSaving)}/yr</span>
              </div>
              <p className="mt-1 text-slate-600">
                Est. Cost: {gbp(u.grossCost)} | Grant: {u.grant > 0 ? `-${gbp(u.grant)}` : "£0"} | <strong>Net Cost: {gbp(u.netCost)}</strong> | Payback: <strong>{u.paybackYears === 0 ? "Instant" : `${u.paybackYears} yrs`}</strong> | 10-Yr Net: <strong className="text-emerald-700">{u.tenYearNetProfit >= 0 ? `+${gbp(u.tenYearNetProfit)}` : gbp(u.tenYearNetProfit)}</strong>
              </p>
            </div>
          ))}
        </div>
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 px-4 text-center text-sm font-medium text-slate-800">
            Your personalised ROI breakdown &amp; PDF roadmap is locked
          </div>
        )}
      </div>

      <div className="mt-5 space-y-2 print:hidden">
        {!unlocked ? (
          <>
            <button type="button" onClick={() => { window.location.href = stripeLink; }} className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-700">
              Unlock Full Personalized PDF Roadmap (£4.99)
            </button>
            <button type="button" onClick={() => setUnlocked(true)} className="block w-full rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 hover:bg-amber-100">
              Dev Mode: Preview Full PDF Free
            </button>
          </>
        ) : (
          <button type="button" onClick={() => window.print()} className="block w-full rounded-lg bg-slate-900 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800">
            Download / Print PDF Roadmap
          </button>
        )}
        <button type="button" onClick={() => window.open(affiliateLink, "_blank", "noopener,noreferrer")} className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50">
          Compare Fixed Heat Pump &amp; Solar Quotes
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 print:hidden">
        <button type="button" onClick={onReset} className="underline">Check another postcode</button>
        <span>Modelled using GOV.UK EPC data &amp; Ofgem baselines</span>
      </div>
    </div>
  );
}
