
"use client";

import { useMemo, useState } from "react";

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

export default function EVCalculator() {
  const [miles, setMiles] = useState(8000);
  const [efficiency, setEfficiency] = useState(3.5);
  const [homeShare, setHomeShare] = useState(80);
  const [standardRate, setStandardRate] = useState(25);
  const [overnightRate, setOvernightRate] = useState(9);
  const [solarShare, setSolarShare] = useState(0);
  const [chargerCost, setChargerCost] = useState(1000);
  const [ownsEV, setOwnsEV] = useState("planning");
  const [propertyType, setPropertyType] = useState("house");
  const [parking, setParking] = useState("private");

  const results = useMemo(() => {
    const annualKwh = miles / Math.max(efficiency, 0.1);
    const homeKwh = annualKwh * homeShare / 100;
    const solarKwh = homeKwh * solarShare / 100;
    const gridKwh = homeKwh - solarKwh;

    const standardCost = gridKwh * standardRate / 100;
    const overnightCost = gridKwh * overnightRate / 100;

    return {
      annualKwh,
      homeKwh,
      solarKwh,
      standardCost,
      overnightCost,
      solarSaving: solarKwh * standardRate / 100,
      tariffSaving: standardCost - overnightCost,
    };
  }, [
    miles, efficiency, homeShare,
    standardRate, overnightRate, solarShare
  ]);

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100";

  const labelClass = "block text-sm font-medium text-slate-800";

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-emerald-50 p-3 text-2xl">
          🚗
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            EV & Home Energy
          </p>
          <h2 className="text-xl font-bold text-slate-900">
            Electric Vehicle Savings Calculator
          </h2>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600">
        Explore how much home EV charging could cost and how
        solar panels and cheaper overnight electricity could
        reduce your energy bills.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label className={labelClass}>
            Do you own or plan to buy an EV?
          </label>
          <select
            value={ownsEV}
            onChange={(e) => setOwnsEV(e.target.value)}
            className={inputClass}
          >
            <option value="owner">I already own an EV</option>
            <option value="planning">I plan to buy an EV</option>
            <option value="researching">Just researching</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Annual mileage: {miles.toLocaleString("en-GB")} miles
          </label>
          <input
            type="range"
            min="2000"
            max="25000"
            step="500"
            value={miles}
            onChange={(e) => setMiles(Number(e.target.value))}
            className="mt-3 w-full accent-emerald-600"
          />
        </div>

        <div>
          <label className={labelClass}>
            Vehicle efficiency: {efficiency.toFixed(1)} miles per kWh
          </label>
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
          <label className={labelClass}>
            Percentage charged at home: {homeShare}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={homeShare}
            onChange={(e) => setHomeShare(Number(e.target.value))}
            className="mt-3 w-full accent-emerald-600"
          />
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">
            Electricity tariff comparison
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Enter your supplier's electricity rates in pence per kWh.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">
                Standard rate (p/kWh)
              </label>
              <input
                type="number"
                min="0"
                max="200"
                step="0.1"
                value={standardRate}
                onChange={(e) => setStandardRate(
                  Math.max(0, Math.min(200, Number(e.target.value) || 0))
                )}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium">
                Overnight rate (p/kWh)
              </label>
              <input
                type="number"
                min="0"
                max="200"
                step="0.1"
                value={overnightRate}
                onChange={(e) => setOvernightRate(
                  Math.max(0, Math.min(200, Number(e.target.value) || 0))
                )}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
          <h3 className="font-semibold text-slate-900">
            ☀️ Solar-powered EV charging
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            What percentage of your home EV charging could be
            supplied by surplus solar electricity?
          </p>
          <label className="mt-3 block text-sm font-medium">
            Solar contribution: {solarShare}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={solarShare}
            onChange={(e) => setSolarShare(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-600"
          />
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">
            Your estimated annual EV charging costs
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Standard tariff</p>
              <p className="mt-1 text-xl font-bold">
                {money(results.standardCost)}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Overnight tariff</p>
              <p className="mt-1 text-xl font-bold text-emerald-800">
                {money(results.overnightCost)}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Annual electricity required</span>
              <strong>{Math.round(results.annualKwh).toLocaleString("en-GB")} kWh</strong>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Home charging electricity</span>
              <strong>{Math.round(results.homeKwh).toLocaleString("en-GB")} kWh</strong>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Solar electricity contribution</span>
              <strong>{Math.round(results.solarKwh).toLocaleString("en-GB")} kWh</strong>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-emerald-700 p-4 text-white">
            <p className="text-sm">Potential annual savings from solar and overnight charging</p>
            <p className="mt-1 text-3xl font-bold">
              {money(results.solarSaving + results.tariffSaving)}
            </p>
            <p className="mt-1 text-xs text-emerald-100">
              Compared with buying all home charging electricity
              at your standard rate, using the assumed solar contribution.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <h3 className="font-semibold text-slate-900">
            Home EV charger installation
          </h3>
          <label className="mt-3 block text-sm font-medium">
            Estimated installation cost (£)
          </label>
          <input
            type="number"
            min="0"
            max="20000"
            value={chargerCost}
            onChange={(e) => setChargerCost(
              Math.max(0, Math.min(20000, Number(e.target.value) || 0))
            )}
            className={inputClass}
          />
          <p className="mt-2 text-xs text-slate-500">
            Your estimated upfront cost is {money(chargerCost)}.
            Actual quotations depend on your property and installation requirements.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <h3 className="font-semibold text-slate-900">
            EV charger grant eligibility
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            Answer these questions to identify which government
            grant guidance may be relevant.
          </p>

          <label className="mt-3 block text-sm font-medium">
            Your property
          </label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className={inputClass}
          >
            <option value="house">House</option>
            <option value="flat">Flat</option>
            <option value="rented">Rented property</option>
            <option value="landlord">I am a landlord</option>
          </select>

          <label className="mt-4 block text-sm font-medium">
            Your parking arrangements
          </label>
          <select
            value={parking}
            onChange={(e) => setParking(e.target.value)}
            className={inputClass}
          >
            <option value="private">Private off-street parking</option>
            <option value="street">On-street parking</option>
            <option value="communal">Communal parking</option>
          </select>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
            {propertyType === "landlord" || propertyType === "rented" ||
             propertyType === "flat" || parking === "street" ||
             parking === "communal" ? (
              <p className="text-slate-700">
                <strong>Potential grant routes to investigate.</strong>
                Your property or parking arrangements may be relevant
                to specific chargepoint grant schemes. Check the current
                eligibility requirements before applying.
              </p>
            ) : (
              <p className="text-slate-700">
                <strong>Standard homeowner route.</strong>
                A homeowner with private off-street parking should not
                assume they qualify for an EV chargepoint grant.
                Check the current government schemes.
              </p>
            )}
            <a
              href="https://www.gov.uk/government/collections/electric-vehicle-chargepoint-grants"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-semibold text-emerald-700 underline"
            >
              Check official GOV.UK grant guidance →
            </a>
          </div>
        </div>
      </div>

      <p className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500">
        Estimates are illustrative, not guaranteed savings. Assumes the
        vehicle uses the stated miles per kWh and excludes charging losses,
        public charging costs, standing charges and charger maintenance.
        Solar savings assume surplus solar electricity would otherwise
        have no alternative value; actual savings depend on export payments
        and when the vehicle is charged. Tariffs and grant eligibility
        change. Check supplier and GOV.UK information before deciding.
      </p>
    </section>
  );
}
