
"use client";

import { useState } from "react";
import EVCalculator from "@/components/EVCalculator";
import EVTariffComparison from "@/components/EVTariffComparison";
import HeatPumpCalculator from "@/components/HeatPumpCalculator";import {
  ASSUMPTIONS as A,
  Result,
  Role,
  UpgradeOption,
} from "@/lib/calc";

// Paywall off while you build trust. If enabled later, payment checks
// must happen on the server rather than relying on a client-side lock.
const PAYWALL_ENABLED = false;

const gbp = (n: number) =>
  (n < 0 ? "-£" : "£") +
  Math.abs(Math.round(n)).toLocaleString("en-GB");

const r10 = (n: number) => Math.round(n / 10) * 10;

const rangeText = (lo: number, hi: number) =>
  `${gbp(r10(lo))} to ${gbp(r10(hi))}`;

const paybackText = (u: UpgradeOption) =>
  u.paybackYears === 0
    ? "Instant"
    : u.paybackYears === null || u.paybackYears > 40
      ? "Not on bills alone"
      : `${u.paybackYears} yrs`;

const sign = (n: number) => (n >= 0 ? "+" : "") + gbp(n);

const ratingColour: Record<string, string> = {
  A: "bg-green-600",
  B: "bg-green-500",
  C: "bg-lime-500",
  D: "bg-yellow-500",
  E: "bg-orange-500",
  F: "bg-orange-600",
  G: "bg-red-600",
};

export default function RoadmapView({
  address,
  role,
  result,
  stripeLink,
  affiliateLink,
  onReset,
  usingBills,
}: {
  address: string;
  role: Role;
  result: Result;
  stripeLink: string;
  affiliateLink: string;
  onReset: () => void;
  usingBills?: boolean;
}) {
  const [unlocked, setUnlocked] = useState(!PAYWALL_ENABLED);
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Property Retrofit &amp; Tariff Assessment
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            {address}
          </h2>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
          {role} Profile
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase text-slate-500">Current EPC</p>
          <span
            className={`mt-2 inline-flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold text-white ${ratingColour[result.rating]}`}
          >
            {result.rating}
          </span>
        </div>

        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-xs uppercase text-amber-800">
            Low-cost savings
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-800">
            ~{gbp(r10(result.overpayment))}/yr
          </p>
          <p className="mt-1 text-[10px] text-amber-800">
            Tariff + quick wins
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-xs uppercase text-emerald-700">
            Grant potential
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {gbp(result.grantTotal)}
          </p>
          <p className="mt-1 text-[10px] text-emerald-700">
            Check eligibility
          </p>
        </div>
      </div>

      {usingBills && (
        <p
          role="note"
          className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900"
        >
          These figures use the usage you entered, so they should be closer to
          your real bills.
        </p>
      )}

      {result.usedFallbacks.length > 0 && (
        <p
          role="note"
          className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900"
        >
          We couldn&apos;t read these from your EPC, so we used typical values:{" "}
          {result.usedFallbacks.join(", ")}. Treat the figures below as rougher
          than usual.
        </p>
      )}

      <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">
          Your EPC Certificate Profile
        </p>
        <p>
          <strong>Floor Area:</strong> {result.floorArea} m² |{" "}
          <strong>Est. Annual Bill:</strong> {gbp(result.totalSpend)} (
          {gbp(result.heatingSpend)} heating /{" "}
          {gbp(result.electricitySpend)} electricity, incl. standing charges)
        </p>
        <p>
          <strong>Current Heating:</strong> {result.heatingType}
        </p>
        <p>
          <strong>Wall Construction:</strong> {result.wallType}
        </p>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200">
        <div
          aria-hidden={!unlocked}
          className={`space-y-3 p-5 ${unlocked ? "" : "select-none blur-sm"}`}
        >
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Financial ROI &amp; Upgrade Roadmap
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              All upgrades together: about{" "}
              <strong>
                {rangeText(result.combined.low, result.combined.high)}
              </strong>{" "}
              a year (best guess {gbp(r10(result.combined.central))}), with
              overlaps taken into account.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              The savings below are for each upgrade on its own, so they
              can&apos;t simply be added up. Ranges show a cautious and an
              optimistic case; paybacks use the middle estimate.
            </p>
          </div>

          {result.upgrades.map((u, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs print:break-inside-avoid"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-900">
                  {idx + 1}. {u.name}
                </span>
                <span className="whitespace-nowrap font-bold text-emerald-700">
                  {rangeText(u.annualSavingLow, u.annualSavingHigh)}/yr
                </span>
              </div>

              <p className="mt-1 text-slate-600">
                Est. cost: {gbp(u.grossCost)} | Grant: {gbp(u.grant)} |{" "}
                <strong>Net cost: {gbp(u.netCost)}</strong> | Payback:{" "}
                <strong>{paybackText(u)}</strong>
              </p>

              <p className="mt-1 text-slate-600">
                10-yr net:{" "}
                <strong
                  className={
                    u.tenYearNetProfit >= 0
                      ? "text-emerald-700"
                      : "text-red-700"
                  }
                >
                  {sign(u.tenYearNetProfit)}
                </strong>
                {" | "}Over ~{u.lifespanYears} yrs:{" "}
                <strong
                  className={
                    u.lifetimeNet >= 0
                      ? "text-emerald-700"
                      : "text-red-700"
                  }
                >
                  {sign(u.lifetimeNet)}
                </strong>
                <span className="text-slate-400"> (flat prices)</span>
              </p>

              {u.notes.map((n, i) => (
                <p key={i} className="mt-1 text-slate-500">
                  {n}
                </p>
              ))}
            </div>
          ))}

          {result.notes.map((n, i) => (
            <p key={i} className="text-xs text-slate-600">
              {n}
            </p>
          ))}

          <div className="rounded-lg border border-slate-200 p-3 text-[11px] text-slate-500 print:break-inside-avoid">
            <p className="font-semibold text-slate-700">
              Assumptions and limits (updated {A.lastUpdated})
            </p>
            <p>
              Prices: {A.priceSource}: electricity{" "}
              {(A.elecPerKwh * 100).toFixed(2)}p/kWh, gas{" "}
              {(A.gasPerKwh * 100).toFixed(2)}p/kWh, plus standing charges.
              Energy use is estimated from your EPC band and floor area, not
              your real bills. Heat pump efficiency {A.heatPumpScop}. Solar:{" "}
              {A.solarKwp}kWp, about {A.solarKwhPerKwp} kWh per kWp a year.
              Prices change every quarter, and grant rules and installer costs
              vary, so get several quotes and check GOV.UK before deciding.
              This is not financial advice.
            </p>
          </div>
        </div>

        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 px-4 text-center text-sm font-medium text-slate-800">
            Your personalised ROI breakdown &amp; PDF roadmap is locked
          </div>
        )}
      </div>

      {/* Existing EV calculator */}
      <EVCalculator />

      {/* Existing EV tariff comparison */}
      <EVTariffComparison />

      {/* New public EV charging map */}
      <EVChargingMap />

      <div className="mt-5 space-y-2 print:hidden">
        {!unlocked ? (
          <>
            <button
              type="button"
              onClick={() => {
                window.location.href = stripeLink;
              }}
              className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-700"
            >
              Unlock Full Personalized PDF Roadmap (£4.99)
            </button>

            {isDev && (
              <button
                type="button"
                onClick={() => setUnlocked(true)}
                className="block w-full rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 hover:bg-amber-100"
              >
                Dev Mode: Preview Full PDF Free
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => window.print()}
            className="block w-full rounded-lg bg-slate-900 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800"
          >
            Download / Print PDF Roadmap
          </button>
        )}

        <a
          href={affiliateLink}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50"
        >
          Compare Fixed Heat Pump &amp; Solar Quotes
        </a>

        <p className="text-[11px] text-slate-500">
          We may earn a commission if you request quotes through this link. It
          doesn&apos;t cost you more.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 print:hidden">
        <button type="button" onClick={onReset} className="underline">
          Check another postcode
        </button>
        <span>Based on public EPC data &amp; Ofgem price cap rates</span>
      </div>
    </div>
  );
}
