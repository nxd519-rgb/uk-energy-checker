
"use client";

import { useMemo, useState } from "react";
import { EV_TARIFFS } from "@/data/evTariffs";

const gbp = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(value);

export default function EVTariffComparison() {
  const [mileage, setMileage] = useState(8000);
  const [efficiency, setEfficiency] = useState(3.5);
  const [overnightShare, setOvernightShare] = useState(90);
  const [expanded, setExpanded] = useState<string | null>(null);

  const comparisons = useMemo(() => {
    const annualKwh = (mileage / efficiency) * 1.1;
    const nightKwh = annualKwh * overnightShare / 100;
    const dayKwh = annualKwh - nightKwh;

    return EV_TARIFFS.map((tariff) => {
      const nightCost = nightKwh * tariff.nightRate / 100;
      const dayCost = dayKwh * tariff.dayRate / 100;

      return {
        ...tariff,
        annualKwh,
        nightCost,
        dayCost,
        annualCost: nightCost + dayCost,
        monthlyCost: (nightCost + dayCost) / 12,
        costPerMile: (nightCost + dayCost) / mileage,
      };
    }).sort((a, b) => a.annualCost - b.annualCost);
  }, [mileage, efficiency, overnightShare]);

  const cheapest = comparisons[0];

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          UK Energy Checker
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">
          UK EV Electricity Tariff Comparison
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Compare EV electricity tariffs and estimate how much
          charging your electric car could cost each year.
        </p>
      </div>

      <div className="mt-5 space-y-5 rounded-xl bg-slate-50 p-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-slate-800">
              Annual driving distance
            </label>
            <strong className="text-sm">
              {mileage.toLocaleString("en-GB")} miles
            </strong>
          </div>
          <input
            type="range"
            min="2000"
            max="25000"
            step="500"
            value={mileage}
            onChange={(e) => setMileage(Number(e.target.value))}
            className="mt-3 w-full accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>2,000 miles</span>
            <span>25,000 miles</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-slate-800">
              Vehicle efficiency
            </label>
            <strong className="text-sm">
              {efficiency.toFixed(1)} mi/kWh
            </strong>
          </div>
          <input
            type="range"
            min="2"
            max="5"
            step="0.1"
            value={efficiency}
            onChange={(e) => setEfficiency(Number(e.target.value))}
            className="mt-3 w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-slate-800">
              Charging during off-peak hours
            </label>
            <strong className="text-sm text-emerald-700">
              {overnightShare}%
            </strong>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={overnightShare}
            onChange={(e) => setOvernightShare(Number(e.target.value))}
            className="mt-3 w-full accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>All daytime</span>
            <span>All overnight</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
          Cheapest estimated tariff in this comparison
        </p>
        <h3 className="mt-2 text-lg font-bold text-emerald-900">
          {cheapest.supplier}
        </h3>
        <p className="text-sm text-emerald-800">
          {cheapest.name}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-emerald-800">Annual EV charging</p>
            <p className="text-2xl font-bold text-emerald-900">
              {gbp(cheapest.annualCost)}
            </p>
          </div>
          <div>
            <p className="text-xs text-emerald-800">Monthly average</p>
            <p className="text-2xl font-bold text-emerald-900">
              {gbp(cheapest.monthlyCost)}
            </p>
          </div>
        </div>
        <a
          href={cheapest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Visit supplier website →
        </a>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-slate-900">
            Compare all available tariffs
          </h3>
          <span className="text-xs text-slate-500">
            {comparisons.length} tariffs
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {comparisons.map((tariff, index) => (
            <div
              key={tariff.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900">
                      {tariff.supplier}
                    </h4>
                    {index === 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">
                        LOWEST ESTIMATE
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {tariff.name}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-slate-900">
                    {gbp(tariff.annualCost)}
                  </p>
                  <p className="text-xs text-slate-500">per year</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="text-slate-500">Day rate</p>
                  <strong>{tariff.dayRate.toFixed(2)}p/kWh</strong>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="text-slate-500">Night rate</p>
                  <strong className="text-emerald-700">
                    {tariff.nightRate.toFixed(2)}p/kWh
                  </strong>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="text-slate-500">Off-peak window</p>
                  <strong>{tariff.hours}</strong>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="text-slate-500">Monthly EV cost</p>
                  <strong>{gbp(tariff.monthlyCost)}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setExpanded(expanded === tariff.id ? null : tariff.id)
                }
                className="mt-3 text-xs font-semibold text-emerald-700 underline"
                aria-expanded={expanded === tariff.id}
              >
                {expanded === tariff.id ? "Hide details" : "View tariff details"}
              </button>

              {expanded === tariff.id && (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <p><strong>Tariff type:</strong> {tariff.tariffType}</p>
                  <p><strong>Eligibility:</strong> {tariff.eligibility}</p>
                  <p><strong>Exit fee:</strong> {tariff.exitFee}</p>
                  {tariff.notes && <p>{tariff.notes}</p>}
                  <p><strong>Rate last checked:</strong> {tariff.checked}</p>
                  <a
                    href={tariff.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-semibold text-emerald-700 underline"
                  >
                    Check supplier tariff and get a quote →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">
          How we calculate your results
        </p>
        <p className="mt-1">
          Annual electricity consumption is estimated using your mileage
          divided by vehicle efficiency, with an additional 10% allowance
          for charging losses. Your consumption is then split between
          day and off-peak electricity using your selected percentage.
        </p>
        <p className="mt-2">
          These are estimates of EV charging energy costs only.
          Standing charges, household electricity consumption, public
          charging, export payments and other tariff conditions are
          excluded. Prices vary by region and may change.
        </p>
        <p className="mt-2">
          Tariff records are manually maintained. Always check the
          supplier's current regional quotation and eligibility before
          switching.
        </p>
      </div>
    </section>
  );
}
