"use client";

import { useState } from "react";
import { Result, Role } from "@/lib/calc";

// Paywall off while you build trust. If you turn it on later, the check MUST
// happen on the server after payment; a client-side lock can be bypassed.
const PAYWALL_ENABLED = false;

const gbp = (n: number) => (n < 0 ? "-£" : "£") + Math.abs(n).toLocaleString("en-GB");
const approx = (n: number) => Math.round(n / 10) * 10;

const ratingColour: Record<string, string> = {
  A: "bg-green-600", B: "bg-green-500", C: "bg-lime-500", D: "bg-yellow-500", E: "bg-orange-500", F: "bg-orange-600", G: "bg-red-600",
};

// Rough lifespans (years) for a longer-term view. Temporary: better placed in calc.ts.
const lifespan = (name: string) =>
  /battery/i.test(name) ? 15 : /solar/i.test(name) ? 25 : /heat pump/i.test(name) ? 18 : 10;

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
  const [unlocked, setUnlocked] = useState(!PAYWALL_ENABLED);
  const isDev = process.env.NODE_ENV !== "production";

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
          <p className="mt-2 text-2xl font-bold text-red-700">~{gbp(approx(result.overpayment))}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-xs uppercase text-emerald-700">Grant potential</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{gbp(result.grantTotal)}</p>
          <p className="mt-1 text-[10px] text-emerald-700">Check eligibility</p>
        </div>
      </div>

      <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">Your EPC Certificate Profile</p>
        <p><strong>Floor Area:</strong> {result.floorArea} m² | <strong>Est. Annual Bill:</strong> {gbp(result.totalSpend)} ({gbp(result.heatingSpend)} heat / {gbp(result.electricitySpend)} elec)</p>
        <p><strong>Current Heating:</strong> {result.heatingType}</p>
        <p><strong>Wall Construction:</strong> {result.wallType || "Not stated on your EPC"}</p>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200">
        <div aria-hidden={!unlocked} className={`space-y-3 p-5 ${unlocked ? "" : "select-none blur-sm"}`}>
          <div>
            <h3 className="text-base font-bold text-slate-900">Financial ROI &amp; Upgrade Roadmap</h3>
            <p className="mt-1 text-xs text-slate-500">
              Savings are estimates for each upgrade on its own. They overlap (for example solar and a smart tariff both reduce your electricity bill), so they can&apos;t simply be added together.
            </p>
          </div>

          {result.upgrades.map((u, idx) => {
            const years = lifespan(u.name);
            const lifetimeNet = Math.round(u.annualSaving * years - u.netCost);
            const isHeatPump = /heat pump/i.test(u.name);
            return (
              <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs print:break-inside-avoid">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">{idx + 1}. {u.name}</span>
                  <span className="font-bold text-emerald-700">~{gbp(approx(u.annualSaving))}/yr</span>
                </div>
                <p className="mt-1 text-slate-600">
                  Est. cost: {gbp(u.grossCost)} | Grant: {u.grant > 0 ? gbp(u.grant) : "£0"} | <strong>Net cost: {gbp(u.netCost)}</strong> | Payback: <strong>{u.paybackYears === 0 ? "Instant" : `${u.paybackYears} yrs`}</strong>
                </p>
                <p className="mt-1 text-slate-600">
                  10-yr net: <strong className={u.tenYearNetProfit >= 0 ? "text-emerald-700" : "text-red-700"}>{u.tenYearNetProfit >= 0 ? "+" : ""}{gbp(u.tenYearNetProfit)}</strong>
                  {" | "}Over ~{years} yrs: <strong className={lifetimeNet >= 0 ? "text-emerald-700" : "text-red-700"}>{lifetimeNet >= 0 ? "+" : ""}{gbp(lifetimeNet)}</strong>
                  <span className="text-slate-400"> (flat prices, no degradation)</span>
                </p>
                {isHeatPump && u.paybackYears > 15 && (
                  <p className="mt-1 text-slate-500">
                    On a modest heating bill, a heat pump is often more about comfort and lower carbon than saving money. Insulation and your tariff make a big difference to the result.
                  </p>
                )}
              </div>
            );
          })}

          <div className="rounded-lg border border-slate-200 p-3 text-[11px] text-slate-500 print:break-inside-avoid">
            <p className="font-semibold text-slate-700">Assumptions and limits</p>
            {/* TODO: replace with the real values from lib/calc.ts (unit prices, solar yield, heat pump efficiency, price cap date) */}
            <p>Figures are estimates based on your EPC data and typical usage, not your actual bills. Energy prices, grant rules and installer costs change. Check current details on GOV.UK and get several quotes before deciding. This is not financial advice.</p>
          </div>
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
            {isDev && (
              <button type="button" onClick={() => setUnlocked(true)} className="block w-full rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 hover:bg-amber-100">
                Dev Mode: Preview Full PDF Free
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={() => window.print()} className="block w-full rounded-lg bg-slate-900 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800">
            Download / Print PDF Roadmap
          </button>
        )}
        <button type="button" onClick={() => window.open(affiliateLink, "_blank", "noopener,noreferrer,sponsored")} className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50">
          Compare Fixed Heat Pump &amp; Solar Quotes
        </button>
        <p className="text-[11px] text-slate-500">
          We may earn a commission if you request quotes through this link. It doesn&apos;t cost you more.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 print:hidden">
        <button type="button" onClick={onReset} className="underline">Check another postcode</button>
        <span>Modelled using GOV.UK EPC data &amp; Ofgem baselines</span>
      </div>
    </div>
  );
}
