
"use client";

import { useState } from "react";

type Props = {
  affiliateLink?: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

export default function HeatPumpCalculator({
  affiliateLink,
}: Props) {
  const [installationCost, setInstallationCost] =
    useState(12000);

  const [grant, setGrant] = useState(7500);

  const [annualSaving, setAnnualSaving] =
    useState(250);

  const netCost = Math.max(
    0,
    installationCost - grant
  );

  const payback =
    annualSaving > 0
      ? netCost / annualSaving
      : null;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-900">
          Heat Pump Installation Calculator
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Estimate the upfront cost of installing a
          heat pump and how long it could take to
          recover that cost through lower energy bills.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm font-medium text-slate-700">
          Installation cost (£)
          <input
            type="number"
            min="0"
            value={installationCost}
            onChange={(e) =>
              setInstallationCost(
                Math.max(0, Number(e.target.value) || 0)
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Assumed grant (£)
          <input
            type="number"
            min="0"
            value={grant}
            onChange={(e) =>
              setGrant(
                Math.max(0, Number(e.target.value) || 0)
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Annual bill saving (£)
          <input
            type="number"
            value={annualSaving}
            onChange={(e) =>
              setAnnualSaving(
                Number(e.target.value) || 0
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Net installation cost
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {money(netCost)}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">
            Estimated annual saving
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {money(annualSaving)}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Simple payback
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-800">
            {payback === null
              ? "No bill-savings payback"
              : `${payback.toFixed(1)} years`}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Important:</strong> These are adjustable
        example assumptions, not a personalised quote.
        Grants depend on eligibility. Actual running
        costs depend on your existing heating system,
        property heat demand, energy tariffs and heat
        pump efficiency. This simple payback calculation
        excludes financing, maintenance and future
        energy price changes.
      </div>

      {affiliateLink && (
        <div className="mt-5">
          <a
            href={affiliateLink}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="block rounded-xl bg-emerald-700 px-5 py-4 text-center font-semibold text-white hover:bg-emerald-800"
          >
            Compare Heat Pump Installation Quotes
          </a>

          <p className="mt-2 text-xs text-slate-500">
            If this is an affiliate referral, we may
            earn a commission when you request a quote.
            This does not increase the price you pay.
          </p>
        </div>
      )}
    </section>
  );
}
