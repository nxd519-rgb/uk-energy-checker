
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

  const [grant, setGrant] = useState(0);
  const [gasUse, setGasUse] = useState(12000);
  const [boilerEfficiency, setBoilerEfficiency] = useState(85);
  const [scop, setScop] = useState(3.0);
  const [gasRate, setGasRate] = useState(7.97);
  const [electricRate, setElectricRate] = useState(26.32);
  const [gasStanding, setGasStanding] = useState(29.68);
  const [removeGas, setRemoveGas] = useState(false);

  const heatDemand = gasUse * boilerEfficiency / 100;
  const gasCost = gasUse * gasRate / 100 + (removeGas ? gasStanding * 365 / 100 : 0);
  const heatPumpCost = heatDemand / Math.max(1, scop) * electricRate / 100;
  const annualSaving = gasCost - heatPumpCost;
  const lowSaving = gasCost - heatDemand / Math.max(1,scop*0.85) * electricRate /100;
  const highSaving = gasCost - heatDemand / (scop*1.15) * electricRate /100;
  const netCost = Math.max(0, installationCost - grant);
  const payback = annualSaving > 0 ? netCost / annualSaving : null;

  const inputs = [
    { label: "Annual gas use for heating and hot water (kWh)", value: gasUse, setter: setGasUse, min: 0 },
    { label: "Boiler efficiency (%)", value: boilerEfficiency, setter: setBoilerEfficiency, min: 1, max: 100 },
    { label: "Seasonal heat pump efficiency (SCOP)", value: scop, setter: setScop, min: 1, max: 10 },
    { label: "Gas unit rate (p/kWh)", value: gasRate, setter: setGasRate, min: 0 },
    { label: "Electricity unit rate (p/kWh)", value: electricRate, setter: setElectricRate, min: 0 },
    { label: "Gas standing charge (p/day)", value: gasStanding, setter: setGasStanding, min: 0 },
  ];

  return (
    <section className="mt-6 rounded-2xl border border-orange-100 bg-white p-5 shadow-lg sm:p-8">
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

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-slate-950 via-orange-950 to-orange-800 p-6 text-white shadow-lg" aria-live="polite"><p className="text-sm text-orange-100">{annualSaving>=0?"Estimated annual heating saving":"Estimated extra annual heating cost"}</p><p className="mt-2 text-5xl font-extrabold">{money(Math.abs(annualSaving))}<span className="text-lg font-normal"> / year</span></p><p className="mt-2 text-orange-100">{money(Math.abs(annualSaving)/12)} per month · running costs only</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm font-medium text-slate-700">
          Gross installation quote before grant (£)
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
          Confirmed or assumed grant (£)
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

        <label className="block text-sm font-medium text-slate-700">Annual gas use for heating and hot water (kWh)<input type="number" min="0" value={gasUse} onChange={e=>setGasUse(Math.max(0,Number(e.target.value)||0))} className="mt-2 w-full rounded-lg border border-slate-300 p-3"/></label>
      </div><details className="mt-4 rounded-xl border p-4"><summary className="cursor-pointer font-medium">Advanced settings and energy rates</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">
        {inputs.slice(1).map(({ label, value, setter, min, max }) => (
          <label key={label} className="block text-sm font-medium text-slate-700">
            {label}
            <input type="number" min={min} max={max} step="any" value={value}
              onChange={(e) => setter(Math.min(max ?? Infinity, Math.max(min, Number(e.target.value) || 0)))}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3" />
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={removeGas} onChange={(e) => setRemoveGas(e.target.checked)} />
          Gas supply removed entirely (avoid gas standing charge)
        </label>
      </div></details>

      <p className="mt-4 text-sm text-slate-600">Efficiency sensitivity (SCOP ±15%): annual net savings {money(lowSaving)} to {money(highSaving)}. Negative values mean higher running costs. This is a scenario, not a confidence interval.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">Annual gas boiler cost: <strong>{money(gasCost)}</strong></div>
        <div className="rounded-xl bg-slate-50 p-4">Annual heat pump cost: <strong>{money(heatPumpCost)}</strong></div>
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
            {annualSaving >= 0 ? "Estimated annual saving" : "Estimated extra annual cost"}
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {money(Math.abs(annualSaving))}
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
        Enter your actual tariff rates. Default rates are Ofgem GB averages for Oct–Dec 2026, not live prices.
        Enter only gas used for heating and hot water, excluding cooking.
        Heat demand is gas use multiplied by boiler efficiency; heat pump electricity use is heat demand divided by SCOP.
        Grants depend on eligibility. Check the{" "}
        <a className="underline" href="https://www.gov.uk/apply-boiler-upgrade-scheme">Boiler Upgrade Scheme</a>
        {" "}and{" "}
        <a className="underline" href="https://www.ofgem.gov.uk/energy-price-cap">Ofgem energy price cap</a>.
        Payback uses the full net installation cost, not the incremental cost versus replacing a boiler. Actual running
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
